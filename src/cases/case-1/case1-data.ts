// Caso 1 (GDP) — carga do Excel via DuckDB (prova de funcionamento).
//
// Fonte: src/cases/case-1/data/IMF_GDP.xlsx (aba "IMF GDP", 192 países + header)
// Colunas: rank | code | country | value (USD) | year
import * as XLSX from "xlsx";
import { queryRows, registerTableFromObjects } from "../../utils/duckdb.ts";
import xlsxUrl from "./data/IMF_GDP.xlsx?url";

export interface Case1Row {
  rank: number;
  code: string;
  country: string;
  value: number;
  year: number;
  value_tn: number;
  computed_rank: number;
}

export const CASE1_TABLE = "case1_gdp";
export const CASE1_SQL = `SELECT
  rank,
  code,
  country,
  value,
  year,
  (value / 1e12) AS value_tn,
  ROW_NUMBER() OVER (ORDER BY value DESC) AS computed_rank
FROM "${CASE1_TABLE}"
ORDER BY rank`;

let cache: Case1Row[] | null = null;
// Promise em voo compartilhada: DataTable e DesignA montam juntos e chamam
// o loader ao mesmo tempo. Sem isso, duas cargas intercalam DROP/CREATE
// e a segunda falha com "Table already exists".
let pending: Promise<Case1Row[]> | null = null;

export async function loadCase1ViaDuckDB(): Promise<Case1Row[]> {
  if (cache) return cache;
  if (!pending) pending = loadUncached();
  try {
    const rows = await pending;
    cache = rows;
    return rows;
  } catch (err) {
    // A carga falhou: libera para uma nova tentativa na próxima chamada.
    pending = null;
    throw err;
  }
}

async function loadUncached(): Promise<Case1Row[]> {
  // 1. Baixa o Excel servido pelo Vite e parseia com SheetJS.
  const res = await fetch(xlsxUrl);
  if (!res.ok) throw new Error(`Falha ao buscar Excel: ${res.status}`);
  const buf = await res.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  // header:1 -> matriz; primeira linha é cabeçalho, resto são dados.
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 });
  const dataRows = matrix.slice(1).filter((r) => r && r[2] != null && r[2] !== "");

  // 2. Normaliza para objetos tipados.
  const objs = dataRows.map((r) => {
    const a = r as unknown[];
    return {
      rank: Number(a[0]),
      code: String(a[1] ?? ""),
      country: String(a[2] ?? ""),
      value: Number(a[3]),
      year: Number(a[4]),
    } as Record<string, unknown>;
  });

  // 3. Registra no DuckDB (tabela própria deste caso).
  await registerTableFromObjects(
    CASE1_TABLE,
    objs,
    [
      { name: "rank", type: "INTEGER" },
      { name: "code", type: "VARCHAR" },
      { name: "country", type: "VARCHAR" },
      { name: "value", type: "DOUBLE" },
      { name: "year", type: "INTEGER" },
    ],
  );

  // 4. Consulta real via SQL (validação: rank confere com ordenação por value?).
  return queryRows<Case1Row>(CASE1_SQL);
}

// SQL do Design A: o Top 20 é selecionado DENTRO do DuckDB
// (ORDER BY + LIMIT). É dessa consulta
// que a visualização é montada.
export const CASE1_TOP20_SQL = `SELECT
  rank,
  code,
  country,
  value,
  year,
  (value / 1e12) AS value_tn
FROM "${CASE1_TABLE}"
ORDER BY value DESC
LIMIT 20`;

// Garante a tabela carregada e retorna só o Top 20 direto do DuckDB.
export async function queryTop20ViaDuckDB(): Promise<Case1Row[]> {
  await loadCase1ViaDuckDB();
  return queryRows<Case1Row>(CASE1_TOP20_SQL);
}
