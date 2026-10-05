// Tabela de prova do DuckDB — renderiza o resultado do SELECT do Caso 1.
// Mostra estado de carregamento, erro (se houver) e a query executada.
import { CASE1_SQL, loadCase1ViaDuckDB } from "./case1-data.ts";

function fmtPct(v: number): string {
  if (!Number.isFinite(v)) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${(v * 100).toFixed(0)}%`;
}

function fmtDelta(v: number): string {
  if (!Number.isFinite(v)) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${Math.round(v * 100)}`;
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
            <th>Group</th>
            <th>Feb 2025</th>
            <th>Feb 2026</th>
            <th>Net Δ (pt)</th>
            <th>Valid. (2026−2025)</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map((r) => {
              const ok = Math.abs(r.net_change - r.computed_change) < 0.005;
              return `<tr>
                <td>${r.group}</td>
                <td class="num">${fmtPct(r.y2025)}</td>
                <td class="num">${fmtPct(r.y2026)}</td>
                <td class="num">${fmtDelta(r.net_change)}</td>
                <td class="num" title="Calculado pelo DuckDB">${fmtDelta(r.computed_change)} ${ok ? "✓" : "⚠"}</td>
              </tr>`;
            })
            .join("")}
        </tbody>
      `;
      target.innerHTML = `
        <h3>Dados (via DuckDB)</h3>
        <p class="duck-ok">✓ ${rows.length} linhas consultadas via DuckDB (tabela <code>case1_approval</code>).</p>
        <p class="placeholder">SQL executado: <code>${CASE1_SQL.replace(/</g, "&lt;")}</code></p>
      `;
      target.appendChild(table);
      const note = document.createElement("p");
      note.className = "placeholder";
      note.textContent =
        "Fonte: MM 2026 W09 Trump Approval Ratings.xlsx — coluna Valid. recalculada no SQL para provar que o DuckDB está consultando de verdade.";
      target.appendChild(note);
    })
    .catch((err) => {
      target.innerHTML = `
        <h3>Dados (via DuckDB)</h3>
        <p class="duck-err">✗ Falha no DuckDB: ${String(err instanceof Error ? err.message : err)}</p>
      `;
    });
}
