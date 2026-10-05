// Tabela de prova do DuckDB - resultado do SELECT do Caso 2 (imigracao).
import { CASE2_SQL, loadCase2 } from "./case2-data.ts";

function fmtVariacao(v: number | null): string {
  if (v === null) return "-";
  return `${v >= 0 ? "+" : ""}${v.toFixed(1)} p.p.`;
}

export function renderDataTable2(target: HTMLElement): void {
  target.innerHTML = `
    <h3>Dados (via DuckDB)</h3>
    <p class="placeholder">Carregando CSV + consultando DuckDB…</p>
  `;

  loadCase2()
    .then((rows) => {
      const table = document.createElement("table");
      table.className = "data-table";
      table.innerHTML = `
        <thead>
          <tr>
            <th>Ano</th>
            <th>% imigrantes</th>
            <th>População (milhões)</th>
            <th>Variação</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (r) => `<tr>
                <td class="num">${r.ano}</td>
                <td class="num">${r.pct_imigrantes.toFixed(1)}%</td>
                <td class="num">${r.populacao_milhoes.toFixed(1)}</td>
                <td class="num">${fmtVariacao(r.variacao)}</td>
              </tr>`,
            )
            .join("")}
        </tbody>
      `;
      target.innerHTML = `
        <h3>Dados (via DuckDB)</h3>
        <p class="duck-ok">✓ ${rows.length} linhas lidas do CSV e consultadas via DuckDB (tabela <code>case2_imigracao</code>).</p>
        <p class="placeholder">SQL executado: <code>${CASE2_SQL.replace(/</g, "&lt;")}</code></p>
      `;
      const wrap = document.createElement("div");
      wrap.className = "table-wrap";
      wrap.appendChild(table);
      target.appendChild(wrap);
    })
    .catch((err) => {
      target.innerHTML = `
        <h3>Dados (via DuckDB)</h3>
        <p class="duck-err">✗ Falha no DuckDB: ${String(err instanceof Error ? err.message : err)}</p>
      `;
    });
}
