// Design B do Caso 2: variacao (pontos percentuais) entre decadas,
// calculada no DuckDB (LAG). Barras pra cima = subiu, pra baixo = caiu.
import * as d3 from "d3";
import { loadCase2 } from "./case2-data.ts";

export function renderDesignB2(target: HTMLElement): void {
  target.innerHTML = `
    <h3>Design B</h3>
    <p class="placeholder">Variação (p.p.) entre décadas, calculada no DuckDB.</p>
  `;
  const div = document.createElement("div");
  target.appendChild(div);

  loadCase2().then((rows) => {
    const data = rows.filter((r) => r.variacao !== null) as Array<{ ano: number; variacao: number }>;

    const width = 600;
    const height = 320;
    const margin = { top: 10, right: 20, bottom: 30, left: 40 };

    const x = d3
      .scaleBand()
      .domain(data.map((r) => String(r.ano)))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const maxAbs = d3.max(data, (r) => Math.abs(r.variacao)) ?? 1;
    const y = d3
      .scaleLinear()
      .domain([-maxAbs, maxAbs])
      .range([height - margin.bottom, margin.top]);

    const svg = d3.select(div).append("svg").attr("width", width).attr("height", height);

    svg
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (r) => x(String(r.ano)) as number)
      .attr("width", x.bandwidth())
      .attr("y", (r) => y(Math.max(0, r.variacao)))
      .attr("height", (r) => Math.abs(y(r.variacao) - y(0)))
      .attr("fill", (r) => (r.variacao >= 0 ? "#2f7d8a" : "#c24b4b"));

    svg
      .append("line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", y(0))
      .attr("y2", y(0))
      .attr("stroke", "#1a3a42");

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickFormat((d) => `${d} p.p.`));
  });
}
