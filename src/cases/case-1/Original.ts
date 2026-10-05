// Visualização original do Caso 1 — imagem de referência em largura máxima.
// Arquivo: src/cases/case-1/data/original_viz_trump_aproval_rating.png
import imgUrl from "./data/original_viz_trump_aproval_rating.png?url";

export function renderOriginal1(target: HTMLElement): void {
  target.innerHTML = `
    <h2>Visualização Original</h2>
  `;
  const img = document.createElement("img");
  img.src = imgUrl;
  img.alt = "Visualização original: Trump approval rating por grupo (CNN)";
  img.className = "original-img";
  target.appendChild(img);
}
