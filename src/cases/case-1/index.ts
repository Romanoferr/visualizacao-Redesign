// Caso 1: modulo independente. Nao compartilha estado com os outros casos.
// Cada funcao render recebe um elemento vazio e cria seu conteudo dentro dele
// (futuramente: seu proprio SVG via D3). Sem classes/interfaces genericas.
import { renderOriginal1 } from "./Original.ts";
import { renderDataTable1 } from "./DataTable.ts";
import { renderDesignA1 } from "./DesignA.ts";
import { renderDesignB1 } from "./DesignB.ts";

export function renderCase1(container: HTMLElement): void {
  const title = document.createElement("h2");
  title.textContent = "Caso 1";
  container.appendChild(title);

  const original = document.createElement("section");
  original.className = "case-section";
  const data = document.createElement("section");
  data.className = "case-section";
  const designA = document.createElement("section");
  designA.className = "case-section";
  const designB = document.createElement("section");
  designB.className = "case-section";
  container.append(original, data, designA, designB);

  renderOriginal1(original);
  renderDataTable1(data);
  renderDesignA1(designA);
  renderDesignB1(designB);
}
