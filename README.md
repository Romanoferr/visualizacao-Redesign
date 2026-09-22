# Visualização de Dados - Redesigns com D3.js

Base mínima (Vite + TypeScript) com 3 casos de estudo em uma única aplicação com abas.
Cada caso tem espaço para Visualização Original, Design A e Design B.

## Como rodar

Pré-requisito: Node e npm.

```bash
npm install
npm run dev      # servidor local (http://localhost:5173)
npm run build    # tsc + build de produção (gera dist/)
npm run preview  # serve o build de produção localmente
```

## Estrutura

```text
src/
├── main.ts               # monta header + abas + área de conteúdo
├── components/Tabs.ts    # troca de abas (limpa o container a cada troca)
├── cases/
│   ├── case-1/index.ts, Original.ts, DesignA.ts, DesignB.ts, data/
│   ├── case-2/...        # independente do caso 1
│   └── case-3/...        # independente dos demais
├── styles/main.css
└── utils/duckdb-extension.ts  # ponto de extensão do DuckDB (não implementado)
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

Exemplo de esqueleto com D3 (após `npm install d3`):

```ts
import * as d3 from "d3";

export function renderDesignA1(target: HTMLElement): void {
  target.innerHTML = `<h3>Design A</h3>`;
  const svg = d3.select(target).append("svg")
    .attr("width", 600)
    .attr("height", 400);
  // ... desenhe aqui
}
```

## DuckDB

Ainda não integrado (ver `src/utils/duckdb-extension.ts`). Quando for usar:

1. Adicione os CSV/JSON em `src/cases/case-N/data/`.
2. Instale a variante browser: `npm install @duckdb/duckdb-wasm`
   (o pacote `duckdb` nativo é só para Node, não serve a esta SPA).
3. Implemente a carga/consulta real e chame-a a partir do `index.ts` do caso.
