// ---------- Helpers ----------
function $(id) { return document.getElementById(id); }

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function coverFromDoc(doc) {
  if (doc.cover_i) return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
  const isbn = Array.isArray(doc.isbn) ? doc.isbn[0] : null;
  if (isbn) return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
  return "https://images.unsplash.com/photo-1455885666463-17da8ae3ddea?auto=format&fit=crop&w=1200&q=70";
}

function bookCardHTML(doc) {
  const title = escapeHtml(doc.title ?? "Untitled");
  const author = escapeHtml(Array.isArray(doc.author_name) ? doc.author_name[0] : "Unknown author");
  const cover = coverFromDoc(doc);
  const workKey = doc.key ? `https://openlibrary.org${doc.key}` : "#";

  return `
    <article class="book-card">
      <div class="book-cover">
        <img src="${cover}" alt="${title}" loading="lazy" />
      </div>
      <div>
        <h3 class="book-title">${title}</h3>
        <div class="book-author">${author}</div>
      </div>
      <a class="btn btn-soft borrow-btn" target="_blank" rel="noopener" href="${workKey}">
        Borrow
      </a>
    </article>
  `;
}

function bindImageFallback(container) {
  container.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", () => {
      img.src = "https://images.unsplash.com/photo-1455885666463-17da8ae3ddea?auto=format&fit=crop&w=1200&q=70";
    }, { once: true });
  });
}

// ---------- Footer year ----------
const yearEl = $("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------- Drawer (mobile menu) ----------
const drawer = $("drawer");
const openMenu = $("openMenu");
const closeMenu = $("closeMenu");

function setDrawer(open) {
  if (!drawer) return;
  drawer.classList.toggle("open", open);
  drawer.setAttribute("aria-hidden", open ? "false" : "true");
}

openMenu?.addEventListener("click", () => setDrawer(true));
closeMenu?.addEventListener("click", () => setDrawer(false));
drawer?.addEventListener("click", (e) => {
  if (e.target === drawer) setDrawer(false);
});

// ---------- Register events (works everywhere) ----------
document.addEventListener("click", (e) => {
  const btn = e.target.closest?.(".register-event");
  if (!btn) return;

  const eventName = btn.getAttribute("data-event") || "Event";
  const key = "bibliotech_registered_events";
  const existing = JSON.parse(localStorage.getItem(key) || "[]");

  if (!existing.includes(eventName)) {
    existing.push(eventName);
    localStorage.setItem(key, JSON.stringify(existing));
    alert(`✅ You are registered for: ${eventName}`);
  } else {
    alert(`ℹ️ You are already registered for: ${eventName}`);
  }
});

// ---------- Real search (Open Library) ----------
const q = $("q");
const explore = $("explore");
const statusEl = $("status");
const resultGrid = $("resultGrid");
const pager = $("pager");
const prevPage = $("prevPage");
const nextPage = $("nextPage");
const pagerInfo = $("pagerInfo");

let currentPage = 1;
let lastQuery = "";
let numFound = 0;
const pageSize = 12;

function setStatus(msg, type = "info") {
  if (!statusEl) return;
  statusEl.textContent = msg;
  // no hero we keep it white-ish; errors slightly pink-ish
  if (type === "error") statusEl.style.color = "rgba(255,210,210,.92)";
  else statusEl.style.color = "rgba(255,255,255,.86)";
}

async function searchOpenLibrary(query, page = 1) {
  const url = new URL("https://openlibrary.org/search.json");
  url.searchParams.set("q", query);
  url.searchParams.set("page", String(page));
  url.searchParams.set("fields", "title,author_name,cover_i,isbn,key");
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

function updatePager() {
  if (!pager || !pagerInfo) return;
  const totalPages = Math.max(1, Math.ceil(numFound / pageSize));
  pagerInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  if (prevPage) prevPage.disabled = currentPage <= 1;
  if (nextPage) nextPage.disabled = currentPage >= totalPages;
  pager.hidden = numFound <= 0;
}

function renderResults(docs) {
  if (!resultGrid) return;

  if (!docs?.length) {
    resultGrid.innerHTML = "";
    if (pager) pager.hidden = true;
    return;
  }

  resultGrid.innerHTML = docs.map(bookCardHTML).join("");
  bindImageFallback(resultGrid);
}

async function runSearch(page = 1) {
  if (!q) return;

  const term = (q.value || "").trim();
  if (!term) {
    q.focus();
    setStatus("Type something to search (title, author or ISBN).", "error");
    return;
  }

  lastQuery = term;
  currentPage = page;

  setStatus("Searching the catalog…");
  if (resultGrid) resultGrid.innerHTML = "";
  if (pager) pager.hidden = true;

  try {
    const data = await searchOpenLibrary(lastQuery, currentPage);
    numFound = data.numFound || 0;

    const docs = Array.isArray(data.docs) ? data.docs.slice(0, pageSize) : [];
    renderResults(docs);
    updatePager();

    if (numFound > 0) {
      setStatus(`Found ${numFound.toLocaleString()} results for “${lastQuery}”.`);
      $("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      setStatus(`No results for “${lastQuery}”.`, "error");
    }
  } catch (err) {
    console.error(err);
    numFound = 0;
    renderResults([]);
    updatePager();
    setStatus("Error searching. Please try again.", "error");
  }
}

explore?.addEventListener("click", () => runSearch(1));
q?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") runSearch(1);
});

prevPage?.addEventListener("click", () => {
  if (currentPage > 1) runSearch(currentPage - 1);
});

nextPage?.addEventListener("click", () => {
  const totalPages = Math.max(1, Math.ceil(numFound / pageSize));
  if (currentPage < totalPages) runSearch(currentPage + 1);
});