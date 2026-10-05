// Navegacao por abas: propositalmente simples, sem roteador ou estado global.
// Cada render D3 deve criar seu SVG dentro do elemento recebido.

export interface Tab {
  id: string;
  label: string;
  render: (container: HTMLElement) => void;
}

export function createTabs(nav: HTMLElement, content: HTMLElement, tabs: Tab[]): void {
  let activeId: string | null = null;

  const buttons = tabs.map((tab) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.role = "tab";
    btn.className = "tab";
    btn.textContent = tab.label;
    btn.dataset.tabId = tab.id;
    btn.addEventListener("click", () => select(tab.id));
    nav.appendChild(btn);
    return btn;
  });

  function select(id: string): void {
    if (id === activeId) return;
    activeId = id;
    for (const b of buttons) {
      const selected = b.dataset.tabId === id;
      b.classList.toggle("active", selected);
      b.setAttribute("aria-selected", String(selected));
    }
    // Limpeza simples do ciclo de vida: suficiente para a fase atual e
    // prepara o terreno para o D3 (sem SVGs residuais entre abas).
    content.innerHTML = "";
    const tab = tabs.find((t) => t.id === id);
    tab?.render(content);
  }

  select(tabs[0].id);
}
