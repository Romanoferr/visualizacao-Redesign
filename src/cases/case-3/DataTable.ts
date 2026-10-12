// Tabela de prova do DuckDB — resultado do SELECT do Caso 3 (produção de petróleo).
import { CASE3_SQL, loadCase3 } from "./case3-data.ts";

// Formata os valores de produção para exibição
function fmtOil(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function renderDataTable3(target: HTMLElement): void {
  // Exibe uma mensagem enquanto os dados são carregados
  target.innerHTML = `
    <h3>Dados (via DuckDB)</h3>
    <p class="placeholder">Carregando CSV + consultando DuckDB…</p>
  `;

  // Carrega os dados
  loadCase3()
    .then((rows) => {
      const table = document.createElement("table");
      table.className = "data-table";

      table.innerHTML = `
        <thead>
          <tr>
            <th>País</th>
            <th>Código</th>
            <th>Ano</th>
            <th>Produção de petróleo (TWh)</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  <td>${row.entity}</td>
                  <td>${row.code}</td>
                  <td class="num">${row.year}</td>
                  <td class="num">${fmtOil(row.oil)}</td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      `;

      // Mostra a confirmação da consulta e o SQL executado
      target.innerHTML = `
        <h3>Dados (via DuckDB)</h3>
        <p class="duck-ok">
          ✓ ${rows.length} linhas consultadas via DuckDB
          (tabela de produção de petróleo).
        </p>
        <p class="placeholder">
          SQL executado:
          <code>${CASE3_SQL.replace(/</g, "&lt;")}</code>
        </p>
      `;

      // Coloca a tabela em um contêiner para permitir rolagem horizontal
      const wrap = document.createElement("div");
      wrap.className = "table-wrap";
      wrap.appendChild(table);

      target.appendChild(wrap);
    })

    // Exibe uma mensagem se a leitura do CSV ou a consulta falhar
    .catch((err: unknown) => {
      const message =
        err instanceof Error ? err.message : String(err);

      target.innerHTML = `
        <h3>Dados (via DuckDB)</h3>
        <p class="duck-err">
          ✗ Falha no DuckDB: ${message}
        </p>
      `;
    });
}
