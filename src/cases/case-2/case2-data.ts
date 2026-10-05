// Caso 2 (imigracao) - carga do CSV via DuckDB.
// Fonte: src/cases/case-2/data/imigracao.csv (US Census Bureau, decenal, 1850-2024)
import { queryRows, registerTableFromObjects } from "../../utils/duckdb.ts";
import csvUrl from "./data/imigracao.csv?url";

export interface Case2Row {
  ano: number;
  pct_imigrantes: number;
  populacao_milhoes: number;
  variacao: number | null;
}

export const CASE2_TABLE = "case2_imigracao";
export const CASE2_SQL = `SELECT
  ano,
  pct_imigrantes,
  populacao_milhoes,
  pct_imigrantes - LAG(pct_imigrantes) OVER (ORDER BY ano) AS variacao
FROM "${CASE2_TABLE}"
ORDER BY ano`;

let cache: Case2Row[] | null = null;

function parseCsv(text: string): Record<string, string>[] {
  const linhas = text.trim().split("\n");
  const header = linhas[0].split(",");
  return linhas.slice(1).map((linha) => {
    const valores = linha.split(",");
    const row: Record<string, string> = {};
    header.forEach((col, i) => (row[col] = valores[i]));
    return row;
  });
}

export async function loadCase2(): Promise<Case2Row[]> {
  if (cache) return cache;

  const res = await fetch(csvUrl);
  if (!res.ok) throw new Error(`Falha ao buscar CSV: ${res.status}`);
  const text = await res.text();
  const objs = parseCsv(text).map((r) => ({
    ano: Number(r.ano),
    pct_imigrantes: Number(r.pct_imigrantes),
    populacao_milhoes: Number(r.populacao_milhoes),
  }));

  await registerTableFromObjects(
    CASE2_TABLE,
    objs,
    [
      { name: "ano", type: "INTEGER" },
      { name: "pct_imigrantes", type: "DOUBLE" },
      { name: "populacao_milhoes", type: "DOUBLE" },
    ],
  );

  const rows = await queryRows<Case2Row>(CASE2_SQL);
  cache = rows;
  return rows;
}
