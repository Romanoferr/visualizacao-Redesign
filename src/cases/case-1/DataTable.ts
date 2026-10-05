// Tabela de prova do DuckDB - renderiza o resultado do SELECT do Caso 1 (GDP).
// Mostra estado de carregamento, erro (se houver) e a query executada.
import { CASE1_SQL, loadCase1ViaDuckDB } from "./case1-data.ts";

function fmtTn(v: number): string {
  if (!Number.isFinite(v)) return "-";
  return `${v.toFixed(2)} tn`;
}

export function renderDataTable1(target: HTMLElement): void {
  target.innerHTML = `
    <h3>Dados (via DuckDB)</h3>
    <p class="placeholder">Carregando Excel + consultando DuckDB…</p>
  `;

  loadCase1ViaDuckDB()
    .then((rows) => {
      const table = document.createElement("table");
      table.className = "data-table";
      table.innerHTML = `
        <thead>
          <tr>
            <th>#</th>
            <th>País</th>
            <th>Cód.</th>
            <th>PIB (USD tn)</th>
            <th>Ano</th>
            <th>Valid. rank</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map((r) => {
              const ok = r.rank === Number(r.computed_rank);
              return `<tr>
                <td class="num">${r.rank}</td>
                <td>${r.country}</td>
                <td>${r.code}</td>
                <td class="num">${fmtTn(r.value_tn)}</td>
                <td class="num">${r.year}</td>
                <td class="num" title="Recalculado pelo DuckDB (ROW_NUMBER por value DESC)">${r.computed_rank} ${ok ? "✓" : "⚠"}</td>
              </tr>`;
            })
            .join("")}
        </tbody>
      `;
      target.innerHTML = `
        <h3>Dados (via DuckDB)</h3>
        <p class="duck-ok">✓ ${rows.length} países lidos do Excel e consultados via DuckDB (tabela <code>case1_gdp</code>).</p>
        <p class="placeholder">SQL executado: <code>${CASE1_SQL.replace(/</g, "&lt;")}</code></p>
      `;
      const wrap = document.createElement("div");
      wrap.className = "table-wrap";
      wrap.appendChild(table);
      target.appendChild(wrap);
      const note = document.createElement("p");
      note.className = "placeholder";
      note.textContent =
        "Fonte: IMF_GDP.xlsx - coluna Valid. rank recalculada no SQL para provar que o DuckDB está consultando de verdade.";
      target.appendChild(note);
    })
    .catch((err) => {
      target.innerHTML = `
        <h3>Dados (via DuckDB)</h3>
        <p class="duck-err">✗ Falha no DuckDB: ${String(err instanceof Error ? err.message : err)}</p>
      `;
    });
}
