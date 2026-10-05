# Visualização de Dados - Redesigns com D3.js

Base mínima (Vite + TypeScript) com 3 casos de estudo em uma única aplicação com abas.
Cada caso tem espaço para Visualização Original, Design A e Design B.

## Como rodar

Pré-requisito: Node e npm.

```bash
npm install
npm run dev      # servidor local (http://localhost:5173)
```

## Estrutura

```text
src/
├── main.ts      
├── components/Tabs.ts    # troca de abas (limpa o container a cada troca)
├── cases/
│   ├── case-1/index.ts, Original.ts, DesignA.ts, DesignB.ts, data/
│   ├── case-2/...        # independente dos demais
│   └── case-3/...        # independente dos demais
├── styles/main.css
└── utils/duckdb-extension.ts
```

## Como implementar uma visualização

Cada arquivo de gráfico (`Original.ts`, `DesignA.ts`, `DesignB.ts`) exporta
uma única função que recebe um elemento **vazio** e renderiza dentro dele:

```ts
// src/cases/case-1/DesignA.ts
export function renderDesignA1(target: HTMLElement): void {
  target.innerHTML = `<h3>Design A</h3>`;
  const div = document.createElement("div");
  target.appendChild(div);
  // Código D3 futuro aqui, criando o SVG dentro de `div`.
}
```

Regras:

1. Entre no `index.ts` do seu caso - é ele que chama as 3 funções render.
2. Edite **só** os arquivos do seu caso. Não mexa nos outros casos nem no `Tabs.ts`.
3. Substitua o `innerHTML` placeholder pelo seu gráfico D3.
4. Crie o SVG sempre **dentro** do elemento recebido (`target`). A troca de aba
   faz `content.innerHTML = ""`, então não há SVG residual — mas só se você
   não desenhar fora do `target`.
5. Coloque CSV/JSON reais em `src/cases/case-N/data/`.


## DuckDB

DuckDB real no browser via `@duckdb/duckdb-wasm` (bundle MVP, sem COOP/COEP).

* `src/utils/duckdb.ts` - reutilizável: `getConnection()`, `execute(sql)`, `queryRows<T>(sql)` e `registerTableFromObjects(tabela, linhas, colunas)`. Cada caso usa sua própria tabela (ex: `case1_approval`).
* `src/cases/case-1/case1-data.ts` - baixa o `.xlsx` (servido pelo Vite), parseia com `xlsx`.
* `src/cases/case-1/DataTable.ts` - renderiza a tabela na aba do caso a partir do resultado do SQL, provando que o DuckDB está consultando de verdade.

