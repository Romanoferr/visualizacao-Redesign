// Ponto de extensao para DuckDB (NAO implementado).
//
// Requisito: usar DuckDB real para consulta/transformacao/validacao
// dos dados.
//
// Proximos passos (um por caso, dentro de src/cases/caso-n/data/):
//   1. Adicionar os arquivos CSV/JSON reais em `data/`.
//   2. Instalar `@duckdb/duckdb` (DuckDB nativo via `duckdb` e para Node).
//   3. Criar neste arquivo (ou em `utils/duckdb.ts`) uma funcao de carga real
//      sobre duckdb-wasm e chama-la a partir de cada `cases/*/index.ts`.
//
export {};
