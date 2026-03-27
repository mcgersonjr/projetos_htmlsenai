// blog.js
// Responsável por:
// - Renderizar cards do blog
// - Busca
// - Filtros (chips)
// - Paginação real

(function(){
  const POSTS = (window.BLOG_POSTS || []).slice();

  // Elementos
  const grid = document.getElementById("grid");
  const count = document.getElementById("count");
  const search = document.getElementById("search");
  const chips = [...document.querySelectorAll("[data-filter]")];
  const pagination = document.getElementById("pagination");

  // Estado
  const PAGE_SIZE = 6;
  let activeFilter = "Todos";
  let query = "";
  let page = 1;

  // Helpers URL (?page=2&cat=Dicas&q=wifi)
  function readParams(){
    const p = new URLSearchParams(location.search);
    page = Math.max(1, parseInt(p.get("page") || "1", 10));
    activeFilter = p.get("cat") || "Todos";
    query = (p.get("q") || "").trim();
    if (search) search.value = query;

    // Atualiza chip ativo visual
    chips.forEach(btn => {
      const val = btn.getAttribute("data-filter");
      btn.setAttribute("aria-pressed", String(val === activeFilter));
    });
  }

  function writeParams(){
    const p = new URLSearchParams();
    if (page > 1) p.set("page", String(page));
    if (activeFilter && activeFilter !== "Todos") p.set("cat", activeFilter);
    if (query) p.set("q", query);
    const newUrl = `${location.pathname}?${p.toString()}`;
    history.replaceState({}, "", newUrl);
  }

  function formatDate(iso){
    // iso: "2026-02-28" -> "28/02/2026"
    const [y,m,d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }

  function applyFilters(list){
    const q = query.toLowerCase();

    return list.filter(post => {
      const matchesCat = (activeFilter === "Todos") || (post.category === activeFilter);
      const matchesQ =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q);

      return matchesCat && matchesQ;
    });
  }

  function renderCards(list){
    if (!grid) return;

    grid.innerHTML = list.map(post => `
      <article class="card">
        <div class="card__media">
          <img src="${post.cover}" alt="${post.title}" />
          <span class="tag">${post.category}</span>
        </div>

        <div class="card__body">
          <div class="meta">
            <span>📅 ${formatDate(post.date)}</span>
            <span class="dot" aria-hidden="true"></span>
            <span>⏱ ${post.readTime}</span>
          </div>

          <h3 class="card__title">${post.title}</h3>
          <p class="card__desc">${post.excerpt}</p>

          <div class="card__actions">
            <a class="read" href="./post.html?id=${post.id}">
              Ler agora <span aria-hidden="true">›</span>
            </a>
            <span aria-hidden="true">📌</span>
          </div>
        </div>
      </article>
    `).join("");
  }

  function renderPagination(totalItems){
    if (!pagination) return;

    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    page = Math.min(page, totalPages);

    const buttons = [];

    // Prev
    buttons.push(`
      <button class="page" type="button" data-page="${page - 1}" ${page === 1 ? "disabled" : ""}>
        ←
      </button>
    `);

    // Números
    // (Simples e bonito: mostra até 7 botões)
    const maxButtons = 7;
    let start = Math.max(1, page - 3);
    let end = Math.min(totalPages, start + (maxButtons - 1));
    start = Math.max(1, end - (maxButtons - 1));

    for (let i = start; i <= end; i++){
      buttons.push(`
        <button class="page" type="button" data-page="${i}" ${i === page ? 'aria-current="page"' : ""}>
          ${i}
        </button>
      `);
    }

    // Next
    buttons.push(`
      <button class="page" type="button" data-page="${page + 1}" ${page === totalPages ? "disabled" : ""}>
        →
      </button>
    `);

    pagination.innerHTML = buttons.join("");

    // Clique dos botões
    pagination.querySelectorAll("[data-page]").forEach(btn => {
      btn.addEventListener("click", () => {
        const next = parseInt(btn.getAttribute("data-page"), 10);
        if (!Number.isFinite(next)) return;
        page = next;
        update();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  function update(){
    const filtered = applyFilters(POSTS);

    // total
    if (count) count.textContent = String(filtered.length);

    // paginação
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (page > totalPages) page = totalPages;

    const start = (page - 1) * PAGE_SIZE;
    const paged = filtered.slice(start, start + PAGE_SIZE);

    renderCards(paged);
    renderPagination(filtered.length);
    writeParams();
  }

  // Eventos
  chips.forEach(btn => {
    btn.addEventListener("click", () => {
      chips.forEach(b => b.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", "true");
      activeFilter = btn.getAttribute("data-filter") || "Todos";
      page = 1;
      update();
    });
  });

  if (search){
    search.addEventListener("input", () => {
      query = (search.value || "").trim();
      page = 1;
      update();
    });
  }

  // init
  readParams();
  update();
})();