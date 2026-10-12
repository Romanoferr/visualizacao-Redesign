import * as d3 from "d3";
import { loadCase3 } from "./case3-data.ts";

export function renderDesignB3(target: HTMLElement): void {
  // Cria a estrutura HTML que receberá o gráfico.
  target.innerHTML = `
    <h3>Design B — Ranking da produção de petróleo</h3>

    <p>
      Evolução anual dos cinco maiores produtores de petróleo.
      Quanto mais alta a linha, melhor a posição no ranking.
    </p>

    <div class="ranking-chart"></div>
  `;

  const chart = target.querySelector(
    ".ranking-chart",
  ) as HTMLDivElement;

  loadCase3()
    .then((rows) => {
      chart.replaceChildren();

      // Mantém apenas registros com ano, produção e país válidos
      const validRows = rows.filter(
        (row) =>
          Number.isFinite(row.year) &&
          Number.isFinite(row.oil) &&
          typeof row.entity === "string" &&
          row.entity.trim() !== "",
      );

      if (validRows.length === 0) {
        chart.textContent = "Nenhum dado disponível.";
        return;
      }

      // Agrupa os dados por ano e país.
      // Isso permite verificar se há mais de um registro para
      // o mesmo país no mesmo ano.
      const grouped = d3.group(
        validRows,
        (row) => row.year,
        (row) => row.entity.trim(),
      );

      const consolidatedRows: {
        entity: string;
        year: number;
        oil: number;
      }[] = [];

      grouped.forEach((countries, year) => {
        countries.forEach((records, entity) => {
          const values = records.map((row) => row.oil);

          // Verificar valores divergentes para o mesmo país e ano
          if (new Set(values).size > 1) {
            console.warn(
              `Valores divergentes para ${entity} em ${year}:`,
              values,
            );
          }

          // Garante um único valor por país e ano
          consolidatedRows.push({
            entity,
            year,
            oil: d3.mean(values) ?? 0,
          });
        });
      });

      const years = Array.from(
        new Set(consolidatedRows.map((row) => row.year)),
      ).sort((a, b) => a - b);

      if (years.length === 0) {
        chart.textContent = "Nenhum ano disponível.";
        return;
      }

      const entities = Array.from(
        new Set(consolidatedRows.map((row) => row.entity)),
      );

      const rankings = new Map<number, Map<string, number>>();

      for (const year of years) {
        // Ordena os países pela produção, da maior para a menor
        // O nome é usado como critério de desempate
        const yearlyRows = consolidatedRows
          .filter((row) => row.year === year)
          .sort(
            (a, b) =>
              b.oil - a.oil ||
              a.entity.localeCompare(b.entity),
          );

        const ranking = new Map<string, number>();

        yearlyRows.forEach((row, index) => {
          ranking.set(row.entity, index + 1);
        });

        rankings.set(year, ranking);
      }

      // Define a estrutura de cada ponto da série histórica
      type RankPoint = {
        year: number;
        rank: number | null;
      };

      // Cria uma série temporal para cada país
      const series = entities
        .map((entity) => ({
          entity,

          values: years.map((year): RankPoint => {
            const rank = rankings.get(year)?.get(entity);

            return {
              year,

              // Mantém a posição somente se estiver no Top 5
              // Os demais anos recebem null para interromper a linha
              rank: rank !== undefined && rank <= 5 ? rank : null,
            };
          }),
        }))
        .filter((country) =>
          country.values.some((point) => point.rank !== null),
        );

      // Definir cores dos países
      const palette = [
        "#0072B2",
        "#D55E00",
        "#009E73",
        "#CC79A7",
        "#E69F00",
        "#56B4E9",
        "#000000",
        "#8B6BB1",
      ];

      const colors = d3
        .scaleOrdinal<string, string>()
        .domain(series.map((country) => country.entity))
        .range(palette);

      const width = 1100;
      const height = 470;
      const margin = {
        top: 45,
        right: 35,
        bottom: 120,
        left: 65,
      };

      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      // Escala horizontal
      const x = d3
        .scalePoint<number>()
        .domain(years)
        .range([0, innerWidth])
        .padding(0.1);

      // Escala vertical
      const y = d3
        .scaleLinear()
        .domain([1, 5])
        .range([0, innerHeight]);

      // Cria o SVG
      const svg = d3
        .select(chart)
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", "100%")
        .attr("role", "img")

      // Cria o grupo principal, deslocado pelas margens
      const g = svg
        .append("g")
        .attr(
          "transform",
          `translate(${margin.left},${margin.top})`,
        );

      // Adiciona linhas horizontais para facilitar a leitura
      g.append("g")
        .call(
          d3.axisLeft(y)
            .tickValues([1, 2, 3, 4, 5])
            .tickSize(-innerWidth)
            .tickFormat(() => ""),
        )
        .call((axis) => {
          axis.select(".domain").remove();
          axis.selectAll("line")
            .attr("stroke", "#e5e7eb")
            .attr("stroke-dasharray", "3 4");
        });

      // Cria o eixo vertical com as posições do ranking
      const yAxis = g
        .append("g")
        .call(
          d3.axisLeft(y)
            .tickValues([1, 2, 3, 4, 5])
            .tickFormat((value) => `${value}º`),
        );

      yAxis.select(".domain").attr("stroke", "#ccc");
      yAxis.selectAll("line").attr("stroke", "#ccc");

      yAxis.selectAll("text")
        .attr("font-family", "Arial, sans-serif")
        .attr("font-size", "12px")
        .attr("fill", "#555");

      const tickStep = Math.max(1, Math.ceil(years.length / 10));

      const visibleYears = years.filter(
        (_, index) =>
          index % tickStep === 0 ||
          index === years.length - 1,
      );

      // Cria o eixo horizontal
      const xAxis = g
        .append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(
          d3.axisBottom(x)
            .tickValues(visibleYears)
            .tickFormat(d3.format("d")),
        );

      xAxis.select(".domain").attr("stroke", "#ccc");
      xAxis.selectAll("line").attr("stroke", "#ccc");

      xAxis.selectAll("text")
        .attr("font-family", "Arial, sans-serif")
        .attr("font-size", "11px")
        .attr("fill", "#555");

      // Define como a linha conecta os pontos de cada país
      // Quando rank é null, a linha é interrompida
      const line = d3
        .line<RankPoint>()
        .defined((point) => point.rank !== null)
        .x((point) => x(point.year)!)
        .y((point) => y(point.rank!));

      for (const country of series) {
        const color = colors(country.entity);

        g.append("path")
          .datum(country.values)
          .attr("fill", "none")
          .attr("stroke", color)
          .attr("stroke-width", 2.2)
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("d", line);

        // Identifica os pontos em que houve mudança de posição
        const changes = country.values.filter((point, index, values) => {
          if (point.rank === null) {
            return false;
          }

          let previousRank: number | null = null;

          for (let i = index - 1; i >= 0; i--) {
            if (values[i].rank !== null) {
              previousRank = values[i].rank;
              break;
            }
          }

          return (
            previousRank === null ||
            point.rank !== previousRank
          );
        });

        g.append("g")
          .attr("class", "country-points")
          .selectAll("circle")
          .data(changes)
          .join("circle")
          .attr("cx", (point) => x(point.year)!)
          .attr("cy", (point) => y(point.rank!)!)
          .attr("r", 3.5)
          .attr("fill", color)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1);
      }

      // Preparar legenda
      const legendItems = series.map((country) => ({
        entity: country.entity,
        color: colors(country.entity),
      }));

      const columns = 3;
      const itemWidth = 220;
      const itemHeight = 22;
      const legendRows = Math.ceil(legendItems.length / columns);
      const legendWidth = columns * itemWidth;

      const legend = svg
        .append("g")
        .attr(
          "transform",
          `translate(${width / 2}, ${
            height - legendRows * itemHeight - 8
          })`,
        );

      legendItems.forEach((item, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);

        const itemX = column * itemWidth - legendWidth / 2;
        const itemY = row * itemHeight;

        const entry = legend
          .append("g")
          .attr("transform", `translate(${itemX}, ${itemY})`);

        // Desenha uma pequena linha com a cor do país
        entry
          .append("line")
          .attr("x1", 0)
          .attr("x2", 20)
          .attr("y1", 0)
          .attr("y2", 0)
          .attr("stroke", item.color)
          .attr("stroke-width", 3);

        // Escreve o nome do país ao lado da linha
        entry
          .append("text")
          .attr("x", 27)
          .attr("y", 4)
          .attr("font-family", "Arial, sans-serif")
          .attr("font-size", "11px")
          .attr("font-weight", "500")
          .attr("fill", "#444")
          .text(item.entity);
      });
    })

    // Tratativa de erros
    .catch((error: unknown) => {
      console.error("Erro ao carregar o ranking:", error);
      chart.textContent = "Não foi possível carregar os dados.";
    });
}
