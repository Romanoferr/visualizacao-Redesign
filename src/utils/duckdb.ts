// Util reutilizável do DuckDB (browser) — singleton compartilhado pelas 3 abas.
//
// Uso por qualquer caso:
//   import { queryRows, execute, registerTableFromObjects } from "../../utils/duckdb.ts";
//   await registerTableFromObjects("minha_tabela", [{a: 1}], [{name:"a", type:"DOUBLE"}]);
//   const rows = await queryRows<{a:number}>(`SELECT * FROM minha_tabela`);
//
// Usa o bundle MVP (sem SharedArrayBuffer), então NÃO exige headers COOP/COEP.
import * as duckdb from "@duckdb/duckdb-wasm";
import duckdbWasmUrl from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url";
import mvpWorkerUrl from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url";

let dbPromise: Promise<duckdb.AsyncDuckDB> | null = null;
let connPromise: Promise<duckdb.AsyncDuckDBConnection> | null = null;

async function getDB(): Promise<duckdb.AsyncDuckDB> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
        mvp: {
          mainModule: duckdbWasmUrl,
          mainWorker: mvpWorkerUrl,
        },
      };
      const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
      const worker = new Worker(bundle.mainWorker!, { type: "module" });
      const logger = new duckdb.ConsoleLogger();
      const db = new duckdb.AsyncDuckDB(logger, worker);
      await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
      return db;
    })();
  }
  return dbPromise;
}

export async function getConnection(): Promise<duckdb.AsyncDuckDBConnection> {
  if (!connPromise) {
    connPromise = (async () => {
      const db = await getDB();
      return await db.connect();
    })();
  }
  return connPromise;
}

export async function execute(sql: string): Promise<void> {
  const conn = await getConnection();
  await conn.query(sql);
}

// SELECT -> objetos JS simples (converte Arrow Table para JSON).
export async function queryRows<T>(sql: string): Promise<T[]> {
  const conn = await getConnection();
  const result = await conn.query(sql);
  // toArray() retorna StructRow; toJSON() achata para objeto puro.
  const arr = result.toArray().map((r) => r.toJSON() as T);
  return arr;
}

export interface TableColumn {
  name: string;
  type: string; // ex: "VARCHAR", "DOUBLE"
}

function escapeIdent(id: string): string {
  return `"${id.replace(/"/g, '""')}"`;
}

function escapeValue(v: unknown): string {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "NULL";
  return `'${String(v).replace(/'/g, "''")}'`;
}

// Apaga (se existir), cria e popula uma tabela a partir de objetos JS.
// Reutilizável: cada caso chama com seu próprio nome de tabela.
export async function registerTableFromObjects(
  table: string,
  rows: Array<Record<string, unknown>>,
  columns: TableColumn[],
): Promise<void> {
  const conn = await getConnection();
  const t = escapeIdent(table);
  await conn.query(`DROP TABLE IF EXISTS ${t}`);
  const ddl = columns.map((c) => `${escapeIdent(c.name)} ${c.type}`).join(", ");
  await conn.query(`CREATE TABLE ${t} (${ddl})`);
  // Insert em lotes para não estourar o tamanho da query.
  const BATCH = 200;
  for (let i = 0; i < rows.length; i += BATCH) {
    const slice = rows.slice(i, i + BATCH);
    const values = slice
      .map(
        (r) =>
          `(${columns.map((c) => escapeValue(r[c.name])).join(", ")})`,
      )
      .join(", ");
    const cols = columns.map((c) => escapeIdent(c.name)).join(", ");
    await conn.query(`INSERT INTO ${t} (${cols}) VALUES ${values}`);
  }
}
