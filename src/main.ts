import "./styles/main.css";
import { createTabs } from "./components/Tabs.ts";
import { renderCase1 } from "./cases/case-1/index.ts";
import { renderCase2 } from "./cases/case-2/index.ts";
import { renderCase3 } from "./cases/case-3/index.ts";

// Ponto de entrada unico da aplicacao.
// A navegacao (abas) e independente das implementacoes dos graficos:
// cada caso expoe apenas uma funcao render que recebe um container vazio.
const app = document.querySelector<HTMLElement>("#app");
if (!app) throw new Error("Elemento #app nao encontrado em index.html.");

app.innerHTML = `
  <header class="header">
    <h1>Visualização de Dados - Redesigns com D3.js</h1>
    <p class="subtitle">3 casos redesenhados - clique para acessá-los</p>
  </header>
  <nav class="tabs" role="tablist" aria-label="Casos de estudo"></nav>
  <main id="case-content" class="content"></main>
`;

const nav = app.querySelector<HTMLElement>(".tabs");
const content = app.querySelector<HTMLElement>("#case-content");
if (!nav || !content) throw new Error("Estrutura base (nav/main) nao encontrada.");

createTabs(nav, content, [
  { id: "caso-1", label: "Caso 1", render: renderCase1 },
  { id: "caso-2", label: "Caso 2", render: renderCase2 },
  { id: "caso-3", label: "Caso 3", render: renderCase3 },
]);
