// Design B - Caso 1 (GDP): gráfico de barras horizontais com D3.js.
//
// Marcador: barra/retângulo (1 país = 1 barra, altura constante, cor única)
// Canal principal: comprimento (GDP -> scaleLinear -> largura da barra)

import * as d3 from "d3";
import {
  queryTop20ViaDuckDB,
  type Case1Row,
} from "./case1-data.ts";

// Cor única: não codifica nenhum atributo
const BAR_COLOR = "#1f77b4";

function fmtTn(v: number): string {
  return `$${(v / 1e12).toFixed(2)}T`;
}

export function renderDesignB1(target: HTMLElement): void {
  target.innerHTML = `
    <h3>Design B - Top 20 Countries by GDP (bar chart)</h3>
    <p class="placeholder">20 de 192 países · cada país = 1 barra · valores em US$ trillions</p>
    <div class="chart-wrap"></div>
  `;
  const wrap = target.querySelector<HTMLElement>(".chart-wrap");
  if (!wrap) return;
  const wrapEl: HTMLElement = wrap;

  // Carregar dados top 20
  queryTop20ViaDuckDB()
    .then((top) => {
      buildChart(wrapEl, top);
    })
    .catch((err) => {
      wrapEl.innerHTML = `<p class="duck-err">✗ Falha no Design B: ${String(err instanceof Error ? err.message : err)}</p>`;
    });
}

function buildChart(wrap: HTMLElement, top: Case1Row[]): void {
  // Dimensões: 28px por país
  const margin = { top: 10, right: 70, bottom: 44, left: 120 };
  const W = (wrap.parentElement ?? wrap).clientWidth || 860;
  const innerW = W - margin.left - margin.right;
  const innerH = top.length * 28;
  const H = innerH + margin.top + margin.bottom;

  // Escala X: GDP -> comprimento da barra. Todas começam em 0
  const x = d3
    .scaleLinear()
    .domain([0, d3.max(top, (d) => d.value) ?? 0])
    .range([0, innerW]);

  // Escala Y: país -> posição vertical
  const y = d3
    .scaleBand()
    .domain(top.map((d) => d.country))
    .range([0, innerH])
    .padding(0.25);

  // Centro vertical de cada linha (para labels e valores)
  const cy = (d: Case1Row) => y(d.country)! + y.bandwidth() / 2;

  // SVG responsivo com grupo deslocad
  const g = d3
    .select(wrap)
    .html("")
    .append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`)
    .attr("width", "100%")
    .attr("role", "img")
    .attr("aria-label", "Bar chart: Top 20 Countries by GDP")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Gridlines verticais discretas
  g.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(x).ticks(6).tickSize(-innerH).tickFormat(() => ""))
    .call((sel) => sel.select(".domain").remove());

  // Uma barra por país
  g.selectAll("rect.bar")
    .data(top)
    .join("rect")
    .attr("class", "bar")
    .attr("x", 0)
    .attr("y", (d) => y(d.country)!)
    .attr("width", (d) => x(d.value))
    .attr("height", y.bandwidth())
    .attr("fill", BAR_COLOR)

  // Nomes dos países (eixo Y)
  g.selectAll("text.country")
    .data(top)
    .join("text")
    .attr("class", "country")
    .attr("x", -10)
    .attr("y", cy)
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .text((d) => d.country);

  // Valor do GDP no final de cada barra
  g.selectAll("text.value")
    .data(top)
    .join("text")
    .attr("class", "value")
    .attr("x", (d) => x(d.value) + 6)
    .attr("y", cy)
    .attr("dy", "0.35em")
    .text((d) => fmtTn(d.value));

  // Eixo X em trilhões
  g.append("g")
    .attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat((d) => `$${(Number(d) / 1e12).toFixed(0)}T`));
  g.append("text")
    .attr("class", "axis-title")
    .attr("x", innerW / 2)
    .attr("y", innerH + 36)
    .attr("text-anchor", "middle")
    .text("GDP (US$ trillions)");
}
