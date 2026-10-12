// Caso 3: modulo independente. Ver comentarios do Caso 1.
import { renderDataTable3 } from "./DataTable.ts";
import { renderOriginal3 } from "./Original.ts";
import { renderDesignA3 } from "./DesignA.ts";
import { renderDesignB3 } from "./DesignB.ts";

export function renderCase3(container: HTMLElement): void {
  const title = document.createElement("h2");
  title.textContent = "Caso 3 - Produção de petróleo por país";
  container.appendChild(title);

  const original = document.createElement("section");
  original.className = "case-section";
  const designA = document.createElement("section");
  designA.className = "case-section";
  const designB = document.createElement("section");
  designB.className = "case-section";
  const data_validation = document.createElement("section");
  data_validation.className = "case-section";
  container.append(original, designA, designB, data_validation);

  renderOriginal3(original);
  renderDesignA3(designA);
  renderDesignB3(designB);
  //renderDataTable3(data_validation);
}
