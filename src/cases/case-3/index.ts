// Caso 3: modulo independente. Ver comentarios do Caso 1.
import { renderOriginal3 } from "./Original.ts";
import { renderDesignA3 } from "./DesignA.ts";
import { renderDesignB3 } from "./DesignB.ts";

export function renderCase3(container: HTMLElement): void {
  const title = document.createElement("h2");
  title.textContent = "Caso 3";
  container.appendChild(title);

  const original = document.createElement("section");
  original.className = "case-section";
  const designA = document.createElement("section");
  designA.className = "case-section";
  const designB = document.createElement("section");
  designB.className = "case-section";
  container.append(original, designA, designB);

  renderOriginal3(original);
  renderDesignA3(designA);
  renderDesignB3(designB);
}
