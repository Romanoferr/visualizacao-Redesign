// Fonte: https://makeovermonday.vercel.app/dataset/2026w14
import imgUrl from "./data/oil_production_original.png?url";

export function renderOriginal3(target: HTMLElement): void {
  target.innerHTML = `
    <h3>Visualização Original</h3>
    <p class="placeholder">
    O gráfico apresenta a evolução da produção de petróleo de diferentes países entre 1900 e 2024.
    <p>
    <p class="placeholder">
    São destacadas as mudanças ao longo do tempo, com a predominância dos Estados Unidos e da Arábia Saudita 
    nos níveis de produção.
    <p>
    
  `;
  const wrap = document.createElement("div");
  wrap.className = "original-pair";

  const img = document.createElement("img");
  img.src = imgUrl;
  img.alt = "Grafico 1: % de imigrantes, eixo 0-16%";
  img.className = "original-img";

  wrap.append(img);
  target.appendChild(wrap);
}
