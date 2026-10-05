import { defineConfig } from "vite";

// MVP do DuckDB dispensa COOP/COEP. Excluímos o wasm do pre-bundle
// e garantimos que .xlsx seja servido como asset (fetch no browser).
export default defineConfig({
  assetsInclude: ["**/*.xlsx"],
  optimizeDeps: { exclude: ["@duckdb/duckdb-wasm"] },
});
