// Design A - Caso 1 (GDP): dot plot horizontal com D3.js.
//
// Pipeline explícito (tudo passa pelo DuckDB):
//   1. Excel -> tabela `case1_gdp` no DuckDB (carga, via loadCase1ViaDuckDB)
//   2. Top 20 via SQL (ORDER BY value DESC LIMIT 20)
//   3. D3 desenha 1 círculo por linha RETORNADA pelo DuckDB
//
// Dado: GDP (quantitativo)  →  Atributo quantitativo
// Marcador: circle (1 país = 1 círculo, tamanho e cor constantes)
// Canal principal: posição horizontal (X) via d3.scaleLinear()
// Posição vertical: apenas separa os países (ordem do ranking) via d3.scaleBand()
// Tarefa: comparar GDP entre países e identificar rapidamente os maiores valores.

import * as d3 from "d3";
import {
  CASE1_TABLE,
  queryTop20ViaDuckDB,
  type Case1Row,
} from "./case1-data.ts";

const DOT_COLOR = "#369a00";
const DOT_RADIUS = 6;

function fmtTnShort(v: number): string {
  return `$${(v / 1e12).toFixed(2)}T`;
}

export function renderDesignA1(target: HTMLElement): void {
  target.innerHTML = `
    <h3>Design A - Top 20 Países por PIB (dot plot)</h3>
    <p class="placeholder">20 de 192 países · cada país = 1 ponto</p>
    <p class="placeholder">Fonte dos pontos: consulta SQL no DuckDB (tabela <code>${CASE1_TABLE}</code>).</p>
    <div class="chart-wrap"></div>
  `;
  const wrap = target.querySelector<HTMLElement>(".chart-wrap");
  if (!wrap) return;
  const wrapEl: HTMLElement = wrap;

  // Garante a carga no DuckDB e busca o Top 20 via SQL (a SELEÇÃO é no DuckDB).
  queryTop20ViaDuckDB()
    .then((top) => {
      buildChart(wrapEl, top);
    })
    .catch((err) => {
      wrapEl.innerHTML = `<p class="duck-err">✗ Falha no Design A: ${String(err instanceof Error ? err.message : err)}</p>`;
    });
}

function buildChart(wrap: HTMLElement, top: Case1Row[]): void {
  // Largura do container e altura = 28px por país.
  const margin = { top: 10, right: 50, bottom: 44, left: 120 };
  const W = (wrap.parentElement ?? wrap).clientWidth || 860;
  const innerW = W - margin.left - margin.right;
  const innerH = top.length * 28;
  const H = innerH + margin.top + margin.bottom;

  // Escalas: X = GDP (0 - máx), Y = um "slot" vertical por país (28p).
  const x = d3
    .scaleLinear()
    .domain([0, d3.max(top, (d) => d.value) ?? 0])
    .range([0, innerW]);
  const y = d3
    .scaleBand()
    .domain(top.map((d) => d.country))
    .range([0, innerH])
    .padding(0.5);

  // Centro vertical da linha de cada país (usado por label, círculo e valor).
  const cy = (d: Case1Row) => y(d.country)! + y.bandwidth() / 2;

  // SVG responsivo (viewBox) com um grupo deslocado pelas margens.
  const g = d3
    .select(wrap)
    .html("") // limpa a montagem anterior
    .append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`)
    .attr("width", "100%")
    .attr("role", "img")
    .attr("aria-label", "Dot plot: Top 20 Países por PIB")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Gridlines verticais: eixo com ticks (-H) e sem texto.
  g.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(x).ticks(5).tickSize(-innerH).tickFormat(() => ""))
    .call((sel) => sel.select(".domain").remove());

  // Nomes dos países (à esquerda, alinhados pelo fim do text).
  g.selectAll("text.country")
    .data(top)
    .join("text")
    .attr("class", "country")
    .attr("x", -10)
    .attr("y", cy)
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .text((d) => d.country);

  // Um círculo por país: X = GDP.
  g.selectAll("circle.dot")
    .data(top)
    .join("circle")
    .attr("class", "dot")
    .attr("cx", (d) => x(d.value))
    .attr("cy", cy)
    .attr("r", DOT_RADIUS)
    .attr("fill", DOT_COLOR);

  // Valor numérico logo à direita do círculo.
  g.selectAll("text.value")
    .data(top)
    .join("text")
    .attr("class", "value")
    .attr("x", (d) => x(d.value) + 10)
    .attr("y", cy)
    .attr("dy", "0.35em")
    .text((d) => fmtTnShort(d.value));

  // Eixo X (em trilhões) e seu título.
  g.append("g")
    .attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat((d) => `$${(Number(d) / 1e12).toFixed(0)}T`));
  g.append("text")
    .attr("class", "axis-title")
    .attr("x", innerW / 2)
    .attr("y", innerH + 36)
    .attr("text-anchor", "middle")
    .text("GDP (US$ trillions)");
}