// Design A do Caso 2: serie completa (1850-2024) com eixo fixo 0-100%.
// Mostra que a variacao real e pequena e que o nivel atual ja ocorreu antes.
import * as d3 from "d3";
import { loadCase2 } from "./case2-data.ts";

export function renderDesignA2(target: HTMLElement): void {
  target.innerHTML = `
    <h3>Design A</h3>
    <p class="placeholder">Escala fixa 0-100%, série completa desde 1850.</p>
  `;
  const div = document.createElement("div");
  target.appendChild(div);

  loadCase2().then((rows) => {
    const width = 600;
    const height = 320;
    const margin = { top: 10, right: 20, bottom: 30, left: 40 };

    const x = d3
      .scaleLinear()
      .domain(d3.extent(rows, (r) => r.ano) as [number, number])
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([0, 100])
      .range([height - margin.bottom, margin.top]);

    const svg = d3.select(div).append("svg").attr("width", width).attr("height", height);

    const area = d3
      .area<(typeof rows)[number]>()
      .x((r) => x(r.ano))
      .y0(y(0))
      .y1((r) => y(r.pct_imigrantes));

    svg.append("path").datum(rows).attr("fill", "#a9d6dc").attr("d", area);

    const line = d3
      .line<(typeof rows)[number]>()
      .x((r) => x(r.ano))
      .y((r) => y(r.pct_imigrantes));

    svg
      .append("path")
      .datum(rows)
      .attr("fill", "none")
      .attr("stroke", "#1a3a42")
      .attr("stroke-width", 2)
      .attr("d", line);

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickFormat((d) => `${d}%`));
  });
}
