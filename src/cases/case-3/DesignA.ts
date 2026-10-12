// Esse design requisitou um arquivo separado de estilos (DesignA.css),
// para manter a visualização mais organizada.

import * as d3 from "d3";
import "./DesignA.css";
import { loadCase3 } from "./case3-data.ts";

// Representa o tipo de uma linha do conjunto de dados
type OilRecord = Awaited<ReturnType<typeof loadCase3>>[number];

// Gera a visualização Design A: pequenos múltiplos.
// Cada país possui seu próprio gráfico de linha, facilitando
// a análise individual e reduzindo a sobreposição das séries.
export function renderDesignA3(target: HTMLElement): void {

  target.innerHTML = `
    <h3>Design A — Produção de petróleo por país</h3>

    <p class="placeholder">
      Série histórica em TWh. Cada país possui uma escala vertical própria.
    </p>

    <button class="scale-toggle" type="button">
      Usar escala vertical comum
    </button>

    <div class="chart-wrapper"></div>
  `;

  const charts = target.querySelector(".chart-wrapper") as HTMLDivElement;
  const toggle = target.querySelector(".scale-toggle") as HTMLButtonElement;

  // false: cada país usa sua própria escala vertical
  // true: todos os países usam a mesma escala vertical
  let commonScale = false;

  loadCase3()
    .then((rows) => {
      // Tratar falta de dados no arquivo
      if (rows.length === 0) {
        charts.textContent = "Nenhum dado disponível.";
        return;
      }

      // Agrupa os registros pelo nome do país
      const countries = d3
        .groups(rows, (row) => row.entity)
        .map(([entity, values]) => ({
          entity,
          values: values.sort((a, b) => a.year - b.year),
        }));

      // Encontra o maior valor de produção entre todos os países,
      // para ser utilizado na escala comum
      const globalMax = d3.max(rows, (row) => row.oil) ?? 1;

      // Descobre o primeiro e o último ano do conjunto de dados
      const minYear = d3.min(rows, (row) => row.year) ?? 1900;
      const maxYear = d3.max(rows, (row) => row.year) ?? 2024;

      // Associa uma cor a cada país
      const colors = d3
        .scaleOrdinal<string, string>()
        .domain(countries.map((country) => country.entity))
        .range(d3.schemeTableau10);

      function draw(): void {
        charts.innerHTML = "";

        // Cria um pequeno gráfico para cada país.
        countries.forEach(({ entity, values }) => {
          const card = document.createElement("section");
          card.className = "chart-card";

          const last = values[values.length - 1];
          const heading = document.createElement("h4");
          heading.textContent = entity;

          card.append(heading);
          charts.appendChild(card);

          // Definir dimensões
          const width = 560;
          const height = 260;
          const margin = {
            top: 15,
            right: 20,
            bottom: 35,
            left: 55,
          };

          // Calcular a área interna disponível para desenhar os dados
          const innerWidth = width - margin.left - margin.right;
          const innerHeight = height - margin.top - margin.bottom;

          // Escala horizontal
          const x = d3
            .scaleLinear()
            .domain([minYear, maxYear])
            .range([0, innerWidth]);

          const localMax = d3.max(values, (row) => row.oil) ?? 1;

          // Escala vertical
          const y = d3
            .scaleLinear()
            .domain([
              0,
              commonScale ? globalMax : localMax * 1.1,
            ])
            .nice()
            .range([innerHeight, 0]);

          // Criar área do gráfico
          const area = d3
            .select(card)
            .append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("width", "100%")
            .attr("role", "img")

          const g = area
            .append("g")
            .attr(
              "transform",
              `translate(${margin.left}, ${margin.top})`,
            );

          // Desenha as linhas horizontais da grade
          g.append("g")
            .attr("class", "grid")
            .call(
              d3.axisLeft(y).ticks(4).tickSize(-innerWidth).tickFormat(() => ""),
            );

          // Desenha o eixo Y
          g.append("g")
            .attr("class", "axis")
            .call(
              d3.axisLeft(y).ticks(4).tickFormat(
                (value) => d3.format("~s")(Number(value))
              ),
            );

          // Desenha o eixo X
          g.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, ${innerHeight})`)
            .call(
              d3.axisBottom(x).ticks(7).tickFormat(d3.format("d")),
            );

          // Contrução das linhas
          const line = d3
            .line<OilRecord>()
            .defined((row) => Number.isFinite(row.oil))
            .x((row) => x(row.year))
            .y((row) => y(row.oil));

          g.append("path")
            .datum(values)
            .attr("fill", "none")
            .attr("stroke", colors(entity))
            .attr("stroke-width", 2.5)
            .attr("stroke-linejoin", "round")
            .attr("d", line);

          // Grupo de elementos para acompanhar o movimento do ponteiro
          const focus = g
            .append("g")
            .style("display", "none")
            .attr("pointer-events", "none");

          focus.append("line")
            .attr("y1", 0)
            .attr("y2", innerHeight)
            .attr("stroke", "#64748b")
            .attr("stroke-dasharray", "4 4");

          focus.append("circle")
            .attr("r", 5)
            .attr("fill", colors(entity))
            .attr("stroke", "#fff")
            .attr("stroke-width", 2);

          // Procura o registro cujo ano está mais próximo do ponteiro.
          const bisect = d3.bisector(
            (row: OilRecord) => row.year,
          ).center;

          // Cria o painel de informação dentro do cartão.
          const tooltip = d3
            .select(card)
            .append("div")
            .attr("class", "tooltip")
            .style("display", "none");

          // Retângulo transparente para capturar os eventos do ponteiro
          g.append("rect")
            .attr("width", innerWidth)
            .attr("height", innerHeight)
            .attr("fill", "transparent")
            .style("cursor", "crosshair")

            // Mostra a linha de referência e o tooltip ao entrar no gráfico.
            .on("pointerenter", () => {
              focus.style("display", null);
              tooltip.style("display", "block");
            })

            .on("pointerleave", () => {
              focus.style("display", "none");
              tooltip.style("display", "none");
            })

            // Atualiza as informações enquanto o ponteiro se movimenta.
            .on("pointermove", (event: PointerEvent) => {
              const [mouseX] = d3.pointer(event);
              const year = x.invert(mouseX);
              const index = bisect(values, year);
              const row = values[index];

              if (!row) return;

              // Posiciona a linha vertical no ano do registro encontrado
              focus.select("line")
                .attr("x1", x(row.year))
                .attr("x2", x(row.year));

              // Move o marcador até a posição da produção daquele ano
              focus.select("circle")
                .attr("cx", x(row.year))
                .attr("cy", y(row.oil));

              tooltip.text(
                `${row.year} — ${d3.format(",.1f")(row.oil)} TWh`,
              );
            });
        });
      }

      // Alterna entre escalas individuais e escala vertical comum
      toggle.addEventListener("click", () => {
        commonScale = !commonScale;

        toggle.textContent = commonScale
          ? "Usar escalas individuais"
          : "Usar escala vertical comum";

        draw();
      });

      draw();
    })

    // Registra o erro para facilitar a investigação durante o desenvolvimento
    .catch((error: unknown) => {
      console.error("Erro ao carregar produção de petróleo:", error);
      charts.textContent = "Não foi possível carregar os dados.";
    });
}