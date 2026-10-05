// Visualizacao original do Caso 2 - duas imagens do mesmo dado (imigracao nos EUA),
// cada uma com uma escala de eixo diferente.
// Fonte: junkcharts.com/mirror-images (graficos de Hansjorg Schulz)
import img1Url from "./data/image_imigracao_1.jpg?url";
import img2Url from "./data/image_imigracao_2.jpg?url";

export function renderOriginal2(target: HTMLElement): void {
  target.innerHTML = `
    <h3>Visualização Original</h3>
    <p class="placeholder">
      Imigração nos EUA (% da população) desde os anos 1970. Mesmos dados nos
      dois gráficos: o primeiro usa eixo 0-16%, o segundo usa 0-100%.
    </p>
  `;
  const wrap = document.createElement("div");
  wrap.className = "original-pair";

  const img1 = document.createElement("img");
  img1.src = img1Url;
  img1.alt = "Grafico 1: % de imigrantes, eixo 0-16%";
  img1.className = "original-img";

  const img2 = document.createElement("img");
  img2.src = img2Url;
  img2.alt = "Grafico 2: % de nao-imigrantes, eixo 0-100%";
  img2.className = "original-img";

  wrap.append(img1, img2);
  target.appendChild(wrap);
}
