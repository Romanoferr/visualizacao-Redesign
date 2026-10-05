// Visualização original do Caso 1 - imagem de referência em largura máxima.
// Arquivo: src/cases/case-1/data/image_GDP_original_vis.png
import imgUrl from "./data/image_GDP_original_vis.png?url";

export function renderOriginal1(target: HTMLElement): void {
  target.innerHTML = `
    <h3>Visualização Original</h3>
    <p class="placeholder">PIB (GDP) por país - imagem de referência para os redesigns.</p>
  `;
  const img = document.createElement("img");
  img.src = imgUrl;
  img.alt = "Visualização original: PIB por país (FMI)";
  img.className = "original-img";
  target.appendChild(img);
}
