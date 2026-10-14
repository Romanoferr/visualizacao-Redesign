# Visualização de Dados — Redesigns com D3.js

Trabalho que analisa três visualizações publicadas e propõe, para cada uma, dois redesigns em D3.js que comunicam melhor o insight que o original pretendia transmitir. O foco não é a estética, e sim a adequação entre dados, tarefa e codificação visual.

Grupo: Antonio Romano Ferreira, Rafael Langsch, Karine Vitória.

## Como rodar

Pré-requisito: Node e npm.

```bash
npm install
npm run dev      # servidor local (http://localhost:5173)
```

Requer browser moderno com Wasm EH + SIMD (Chrome/Edge 95+, Firefox 131+). O bundle EH do DuckDB dispensa headers COOP/COEP.

## Os três casos

Uma aba por caso; cada aba mostra o original, o Design A e o Design B.

| Caso | Tema | Fonte | Dado |
|-----|------|-------|------|
| 1 | PIB por país (FMI) | Makeover Monday 2026 W34 — Global GDP Ranks | 192 países × PIB nominal (US$) |
| 2 | Imigração nos EUA | Junk Charts — Mirror images | Série decenal 1850–2024, % de imigrantes |
| 3 | Produção de petróleo por país | Makeover Monday 2026 W14 | Séries anuais 1900–2024 por país, em TWh (875 registros) |

## Arquitetura

Vite + TypeScript, D3.js v7 para todas as visualizações, DuckDB-wasm para carregar, transformar e validar os dados no navegador. Nenhuma biblioteca de visualização de alto nível; a única dependência extra é o `xlsx`, que apenas lê a planilha do Caso 1.

| Camada | Arquivo(s) | Papel |
|--------|-----------|-------|
| Navegação | `src/main.ts`, `src/components/Tabs.ts` | Uma aba por caso; a troca de aba limpa o container antes de renderizar |
| Acesso a dados | `src/utils/duckdb.ts` | Inicializa o DuckDB-wasm e expõe `registerTableFromObjects` e `queryRows` |
| Carga por caso | `src/cases/case-N/caseN-data.ts` | Lê o arquivo bruto (CSV/XLSX), cria uma tabela no DuckDB e devolve o resultado de uma consulta SQL |
| Visualizações | `Original.ts`, `DesignA.ts`, `DesignB.ts` | Cada arquivo exporta uma função que desenha seu SVG dentro do elemento recebido |
| Validação | `DataTable.ts` | Exibe o resultado do SQL em tabela, para conferir os dados usados nos gráficos |

```text
src/
├── main.ts
├── components/Tabs.ts    # troca de abas (limpa o container a cada troca)
├── cases/
│   ├── case-1/index.ts, Original.ts, DesignA.ts, DesignB.ts, case1-data.ts, DataTable.ts, data/
│   ├── case-2/...        # independente dos demais
│   └── case-3/...        # independente dos demais
├── styles/main.css
└── utils/duckdb.ts
```

Contrato de cada gráfico: uma única função que recebe um elemento **vazio** e renderiza dentro dele (o SVG sempre dentro do `target`, nunca fora). Cada caso é um módulo independente — edite só os arquivos do seu caso, sem mexer nos outros nem no `Tabs.ts`. CSV/XLSX reais ficam em `src/cases/case-N/data/`.

## Uso do DuckDB

DuckDB real no browser via `@duckdb/duckdb-wasm`. Não é só um repositório: parte da transformação que alimenta os gráficos acontece em SQL.

- **Caso 1:** `ROW_NUMBER() OVER (ORDER BY value DESC)` recalcula o ranking, converte o valor para trilhões (`value / 1e12`) e o Top 20 é selecionado em SQL (`ORDER BY value DESC LIMIT 20`).
- **Caso 2:** `pct_imigrantes - LAG(pct_imigrantes) OVER (ORDER BY ano)` calcula a variação entre décadas usada no Design B.
- **Caso 3:** a tabela é consultada ordenada por ano; o código verifica registros duplicados por país e ano antes de calcular o ranking do Design B.

`src/utils/duckdb.ts` é reutilizável (`getConnection()`, `execute(sql)`, `queryRows<T>(sql)`, `registerTableFromObjects(tabela, linhas, colunas)`) e cada caso usa sua própria tabela (`case1_gdp`, `case2_imigracao`, `case3_oil_production`).
