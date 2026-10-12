import * as d3 from "d3";
import { loadCase3 } from "./case3-data.ts";

// Representa uma linha do conjunto de dados
type OilRecord = Awaited<ReturnType<typeof loadCase3>>[number];

// Gera a visualização Design A: pequenos múltiplos.
// Cada país possui seu próprio gráfico de produção ao longo do tempo.
export function renderDesignA3(target: HTMLElement): void {
  target.innerHTML = `
    <h3>Design A — Evolução no Tempo</h3>

    <p class="placeholder">
      Série histórica em TWh. Cada país possui uma escala vertical própria.
    </p>

    <button class="scale-toggle" type="button">
      Usar escala vertical comum
    </button>

    <div class="chart-wrapper"></div>
  `;

  const charts = target.querySelector(
    ".chart-wrapper",
  ) as HTMLDivElement;

  const toggle = target.querySelector(
    ".scale-toggle",
  ) as HTMLButtonElement;

  // Aplica os estilos gerais da visualização
  d3.select(target)
    .style("font-family", "Arial, sans-serif")
    .style("color", "#333");

  // Configura a aparência do título
  d3.select(target)
    .select("h3")
    .style("margin", "0 0 8px")
    .style("font-size", "22px")
    .style("font-weight", "600");

  // Configura o texto explicativo
  d3.select(target)
    .select(".placeholder")
    .style("margin", "0 0 16px")
    .style("color", "#666")
    .style("font-size", "14px");

  // Configura o botão de alternância de escalas
  d3.select(toggle)
    .style("margin-bottom", "16px")
    .style("padding", "8px 12px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "6px")
    .style("background", "#fff")
    .style("color", "#333")
    .style("font-size", "13px")
    .style("cursor", "pointer");

  // Cria duas colunas quando houver espaço suficiente
  // auto-fit adapta a quantidade de colunas à largura disponível
  d3.select(charts)
    .style("display", "grid")
    .style("grid-template-columns", "repeat(auto-fit, minmax(min(100%, 420px), 1fr))")
    .style("gap", "20px")
    .style("width", "100%");

  // false: cada país possui sua própria escala vertical
  // true: todos os países compartilham a mesma escala vertical
  let commonScale = false;

  loadCase3()
    .then((rows) => {
      if (rows.length === 0) {
        charts.textContent = "Nenhum dado disponível.";
        return;
      }

      // Agrupa os registros por país
      const countries = d3
        .groups(rows, (row) => row.entity)
        .map(([entity, values]) => ({
          entity,
          values: values.sort((a, b) => a.year - b.year),
        }));

      // Encontra o maior valor de produção entre todos os países,
      // para ser utilizado na escala comum
      const globalMax = d3.max(rows, (row) => row.oil) ?? 1;

      const minYear = d3.min(rows, (row) => row.year) ?? 1900;
      const maxYear = d3.max(rows, (row) => row.year) ?? 2024;

      // Associa uma cor a cada país
      const colors = d3
        .scaleOrdinal<string, string>()
        .domain(countries.map((country) => country.entity))
        .range(d3.schemeTableau10);

      function draw(): void {
        charts.replaceChildren();

        countries.forEach(({ entity, values }) => {
          // Cria um cartão para o país
          const card = document.createElement("section");
          card.className = "chart-card";

          d3.select(card)
            .style("position", "relative")
            .style("min-width", "0")
            .style("padding", "16px")
            .style("border", "1px solid #ddd")
            .style("border-radius", "10px")
            .style("background", "#fff");

          const heading = document.createElement("h4");
          heading.textContent = entity;

          d3.select(heading)
            .style("margin", "0 0 6px")
            .style("font-size", "18px")
            .style("font-weight", "600");

          card.appendChild(heading);
          charts.appendChild(card);

          const width = 560;
          const height = 260;

          const margin = {
            top: 15,
            right: 20,
            bottom: 35,
            left: 55,
          };

          const innerWidth = width - margin.left - margin.right;
          const innerHeight = height - margin.top - margin.bottom;

          // Escala horizontal
          const x = d3
            .scaleLinear()
            .domain([minYear, maxYear])
            .range([0, innerWidth]);

          const localMax = d3.max(values, (row) => row.oil) ?? 1;

          // Define a escala vertical
          const y = d3
            .scaleLinear()
            .domain([
              0,
              commonScale ? globalMax : localMax * 1.1,
            ])
            .nice()
            .range([innerHeight, 0]);

          // Cria o SVG
          const svg = d3
            .select(card)
            .append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("width", "100%")
            .attr("role", "img")
            .attr(
              "aria-label",
              `Evolução da produção de petróleo de ${entity}`,
            )
            .style("display", "block")
            .style("width", "100%")
            .style("height", "auto");

          // Cria o grupo principal do gráfico
          const g = svg
            .append("g")
            .attr(
              "transform",
              `translate(${margin.left}, ${margin.top})`,
            );

          // Grade horizontal
          const grid = g
            .append("g")
            .attr("class", "grid")
            .call(
              d3.axisLeft(y)
                .ticks(4)
                .tickSize(-innerWidth)
                .tickFormat(() => ""),
            );

          // LInhas de grade
          grid.select(".domain").remove();

          grid.selectAll("line")
            .style("stroke", "#e5e7eb")
            .style("stroke-dasharray", "3 3");

          // Eixo vertical
          const yAxis = g
            .append("g")
            .attr("class", "axis")
            .call(
              d3.axisLeft(y)
                .ticks(4)
                .tickFormat((value) => d3.format("~s")(Number(value))),
            );

          yAxis.select(".domain")
            .style("stroke", "#ccc");

          yAxis.selectAll("line")
            .style("stroke", "#ccc");

          yAxis.selectAll("text")
            .style("font-size", "11px")
            .style("fill", "#555");

          // Eixo horizontal
          const xAxis = g
            .append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, ${innerHeight})`)
            .call(
              d3.axisBottom(x)
                .ticks(7)
                .tickFormat(d3.format("d")),
            );

          xAxis.select(".domain")
            .style("stroke", "#ccc");

          xAxis.selectAll("line")
            .style("stroke", "#ccc");

          xAxis.selectAll("text")
            .style("font-size", "11px")
            .style("fill", "#555");

          const line = d3
            .line<OilRecord>()
            .defined((row) => Number.isFinite(row.oil))
            .x((row) => x(row.year))
            .y((row) => y(row.oil));

          // Desenha a série histórica do país
          g.append("path")
            .datum(values)
            .attr("fill", "none")
            .attr("stroke", colors(entity))
            .attr("stroke-width", 2.5)
            .attr("stroke-linejoin", "round")
            .attr("d", line);

          // Cria um grupo para a linha de referência e o marcador
          const focus = g
            .append("g")
            .style("display", "none")
            .attr("pointer-events", "none");

          // Linha vertical que indica o ano selecionado
          focus.append("line")
            .attr("y1", 0)
            .attr("y2", innerHeight)
            .style("stroke", "#64748b")
            .style("stroke-dasharray", "4 4");

          // Círculo que destaca o valor do ano selecionado
          focus.append("circle")
            .attr("r", 5)
            .attr("fill", colors(entity))
            .attr("stroke", "#fff")
            .attr("stroke-width", 2);

          // Encontra o registro mais próximo do ano apontado
          const bisect = d3.bisector(
            (row: OilRecord) => row.year,
          ).center;

          // Cria o painel de informação do ano e da produção
          const tooltip = d3
            .select(card)
            .append("div")
            .attr("class", "tooltip")
            .style("display", "none")
            .style("position", "absolute")
            .style("z-index", "1")
            .style("left", "12px")
            .style("bottom", "12px")
            .style("max-width", "calc(100% - 24px)")
            .style("padding", "7px 10px")
            .style("border-radius", "6px")
            .style("color", "#fff")
            .style("background", "#172033")
            .style("font-size", "12px")
            .style("pointer-events", "none");

          // Retângulo transparente para capturar os eventos do ponteiro
          g.append("rect")
            .attr("width", innerWidth)
            .attr("height", innerHeight)
            .attr("fill", "transparent")
            .style("cursor", "crosshair")

            // Mostra os elementos de destaque ao entrar no gráfico
            .on("pointerenter", () => {
              focus.style("display", null);
              tooltip.style("display", "block");
            })

            // Esconde os elementos de destaque ao sair do gráfico
            .on("pointerleave", () => {
              focus.style("display", "none");
              tooltip.style("display", "none");
            })

            // Atualiza o destaque conforme o ponteiro se movimenta
            .on("pointermove", (event: PointerEvent) => {
              const [mouseX] = d3.pointer(event, g.node());
              const year = x.invert(mouseX);
              const index = bisect(values, year);
              const row = values[index];

              if (!row) return;

              focus.select("line")
                .attr("x1", x(row.year))
                .attr("x2", x(row.year));

              focus.select("circle")
                .attr("cx", x(row.year))
                .attr("cy", y(row.oil));

              tooltip.text(
                `${row.year} — ${d3.format(",.1f")(row.oil)} TWh`,
              );
            });
        });
      }

      // Alterna entre escalas individuais e escala comum.
      toggle.addEventListener("click", () => {
        commonScale = !commonScale;

        toggle.textContent = commonScale
          ? "Usar escalas individuais"
          : "Usar escala vertical comum";

        draw();
      });

      draw();
    })

    // Tratativa de erros
    .catch((error: unknown) => {
      console.error("Erro ao carregar produção de petróleo:", error);
      charts.textContent = "Não foi possível carregar os dados.";
    });
}
