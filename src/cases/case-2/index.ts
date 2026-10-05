// Caso 2: modulo independente. Ver comentarios do Caso 1.
import { renderOriginal2 } from "./Original.ts";
import { renderDataTable2 } from "./DataTable.ts";
import { renderDesignA2 } from "./DesignA.ts";
import { renderDesignB2 } from "./DesignB.ts";

export function renderCase2(container: HTMLElement): void {
  const title = document.createElement("h2");
  title.textContent = "Caso 2 - Imigração nos EUA";
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

  renderOriginal2(original);
  renderDataTable2(data);
  renderDesignA2(designA);
  renderDesignB2(designB);
}
