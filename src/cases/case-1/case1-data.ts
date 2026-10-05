// Caso 1 — carga do Excel via DuckDB (prova de funcionamento).
//
// Fonte: src/cases/case-1/data/MM 2026 W09 Trump Approval Ratings.xlsx
// Planilha: 14 linhas (header + 13 grupos), colunas Group | Fev/2025 | Fev/2026 | Net change.
//
import * as XLSX from "xlsx";
import { queryRows, registerTableFromObjects } from "../../utils/duckdb.ts";
import xlsxUrl from "./data/MM 2026 W09 Trump Approval Ratings.xlsx?url";

export interface Case1Row {
  group: string;
  y2025: number;
  y2026: number;
  net_change: number;
  computed_change: number;
}

export const CASE1_TABLE = "case1_approval";
export const CASE1_SQL = `SELECT
  "group",
  y2025,
  y2026,
  net_change,
  (y2026 - y2025) AS computed_change
FROM "${CASE1_TABLE}"
ORDER BY rowid`;

let cache: Case1Row[] | null = null;

export async function loadCase1ViaDuckDB(): Promise<Case1Row[]> {
  if (cache) return cache;

  // 1. Baixa o Excel servido pelo Vite e parseia com SheetJS.
  const res = await fetch(xlsxUrl);
  if (!res.ok) throw new Error(`Falha ao buscar Excel: ${res.status}`);
  const buf = await res.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  // header:1 -> matriz; primeira linha é cabeçalho, resto são dados.
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 });
  const dataRows = matrix.slice(1).filter((r) => r && r[0] != null && r[0] !== "");

  // 2. Normaliza para objetos tipados (Excel traz frações 0.48 ou strings "48%").
  const objs = dataRows.map((r) => {
    const toNum = (v: unknown): number => {
      if (typeof v === "number") return v;
      if (typeof v === "string") {
        const s = v.trim().replace("%", "").replace(",", ".");
        const n = Number(s);
        // "48" no Excel pode significar 48% -> 0.48
        return Number.isFinite(n) && Math.abs(n) > 1 ? n / 100 : n;
      }
      if (v instanceof Date) return NaN;
      return Number(v);
    };
    return {
      group: String((r as unknown[])[0]),
      y2025: toNum((r as unknown[])[1]),
      y2026: toNum((r as unknown[])[2]),
      net_change: toNum((r as unknown[])[3]),
    } as Record<string, unknown>;
  });

  // 3. Registra no DuckDB (tabela própria deste caso — reutilizável p/ outros casos).
  await registerTableFromObjects(
    CASE1_TABLE,
    objs,
    [
      { name: "group", type: "VARCHAR" },
      { name: "y2025", type: "DOUBLE" },
      { name: "y2026", type: "DOUBLE" },
      { name: "net_change", type: "DOUBLE" },
    ],
  );

  // 4. Consulta real via SQL (validação: net_change confere com y2026-y2025?).
  const rows = await queryRows<Case1Row>(CASE1_SQL);
  cache = rows;
  return rows;
}
