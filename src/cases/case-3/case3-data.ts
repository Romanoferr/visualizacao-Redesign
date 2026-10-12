import { queryRows, registerTableFromObjects } from "../../utils/duckdb.ts";
import csvUrl from "./data/oil_production_by_country.csv?url";

export interface Case3Row {
  entity: string;
  code: string;
  year: number;
  oil: number
}

export const CASE3_TABLE = "case3_oil_production";
export const CASE3_SQL = `SELECT
  entity,
  code,
  year,
  oil
FROM "${CASE3_TABLE}"
ORDER BY year`;

let cache: Case3Row[] | null = null;

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

export async function loadCase3(): Promise<Case3Row[]> {
  if (cache) return cache;

  const res = await fetch(csvUrl);
  if (!res.ok) throw new Error(`Falha ao buscar CSV: ${res.status}`);
  const text = await res.text();

  const objs = parseCsv(text).map((r) => ({
    entity: String(r["Entity"]),
    code: String(r["Code"]),
    year: Number(r["Year"]),
    oil: Number(r["Oil"])
  }));

  await registerTableFromObjects(
    CASE3_TABLE,
    objs,
    [
        { name: "entity", type: "VARCHAR" },
        { name: "code", type: "VARCHAR" },
        { name: "year", type: "INTEGER" },
        { name: "oil", type: "DOUBLE" }
    ],
  );

  const rows = await queryRows<Case3Row>(CASE3_SQL);
  cache = rows;
  return rows;
}
