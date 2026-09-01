(function () {
  const { spells, maxTier, classificationSlots, wikiName } = window.SPELLBOOK;

  const page = document.getElementById("page");
  const searchInput = document.getElementById("spell-search");
  const searchResults = document.getElementById("search-results");
  const foundationList = document.getElementById("foundation-list");

  const byId = Object.fromEntries(spells.map((spell) => [spell.id, spell]));

  function slug(value) {
    return String(value).toLowerCase().replace(/\s+/g, "-");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function unique(values) {
    return [...new Set(values)];
  }

  function allCategories() {
    return unique(spells.flatMap((spell) => spell.categories)).sort();
  }

  function spellsInCategory(name) {
    const key = name.toLowerCase();
    return spells.filter((spell) =>
      spell.categories.some((category) => category.toLowerCase() === key)
    );
  }

  function spellsInTier(tier) {
    return spells.filter((spell) => spell.tier === Number(tier));
  }

  function parseRoute() {
    const raw = (location.hash || "#/").replace(/^#/, "");
    const parts = raw.split("/").filter(Boolean);
    if (parts.length === 0) return { name: "home" };
    if (parts[0] === "spells") return { name: "spells" };
    if (parts[0] === "spell" && parts[1]) return { name: "spell", id: parts[1] };
    if (parts[0] === "tiers") return { name: "tiers" };
    if (parts[0] === "tier" && parts[1]) return { name: "tier", id: Number(parts[1]) };
    if (parts[0] === "categories") return { name: "categories" };
    if (parts[0] === "category" && parts[1]) return { name: "category", id: parts[1] };
    return { name: "home" };
  }

  function setActiveNav(name) {
    document.querySelectorAll(".main-nav a").forEach((link) => {
      link.classList.toggle("is-active", link.dataset.nav === name);
    });
  }

  function sigil(element) {
    const paths = {
      Fire: '<path d="M24 6c2 8-6 10-4 18 1 5 6 8 10 8 8 0 14-7 12-16-1-6-6-9-8-14-6 5-8 10-10 4z" fill="#c45c1a"/><path d="M22 28c0 6 4 10 10 10 5 0 8-3 8-8 0-6-6-8-8-14-3 6-10 6-10 12z" fill="#e8a04a"/>',
      Earth: '<rect x="10" y="28" width="28" height="10" fill="#6b7a32"/><path d="M8 28 L24 10 L40 28z" fill="#8a9a48"/><path d="M16 28 L24 16 L32 28z" fill="#cbb892"/>',
      Air: '<path d="M8 18h22c4 0 7-3 7-6s-3-6-7-6c-2 0-4 1-5 2" stroke="#5b8aa8" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M8 28h26c5 0 8 3 8 6s-3 6-8 6c-2.5 0-5-1-6-3" stroke="#7eb8da" stroke-width="3" fill="none" stroke-linecap="round"/>',
      Water: '<path d="M24 8c0 0-12 16-12 24a12 12 0 0024 0c0-8-12-24-12-24z" fill="#2a6f86"/><path d="M24 18c-4 6-5 10-5 14a5 5 0 0010 0c0-4-1-8-5-14z" fill="#7ec8d8"/>',
    };
    return `<div class="sigil" aria-hidden="true"><svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">${paths[element] || ""}</svg></div>`;
  }

  function classificationValue(spell, slot) {
    const value = spell.classifications?.[slot];
    if (!value) return '<span class="placeholder">—</span>';
    return escapeHtml(value);
  }

  function infobox(spell) {
    const classRows = classificationSlots
      .map(
        (slot) =>
          `<tr><th>${escapeHtml(slot)}</th><td>${classificationValue(spell, slot)}</td></tr>`
      )
      .join("");
    return `
      <aside class="infobox" data-element="${escapeHtml(spell.element)}">
        <div class="infobox-head">
          ${escapeHtml(spell.name)}
          <span class="incant">${escapeHtml(spell.incantation)}</span>
        </div>
        ${sigil(spell.element)}
        <table>
          <tr><th>Tier</th><td><a href="#/tier/${spell.tier}">Level ${spell.tier}</a></td></tr>
          <tr><th>Incantation</th><td><em>${escapeHtml(spell.incantation)}</em> <span class="muted">(${escapeHtml(spell.incantationGloss)})</span></td></tr>
          ${classRows}
          <tr><th>Categories</th><td>${spell.categories
            .map((category) => `<a href="#/category/${slug(category)}">${escapeHtml(category)}</a>`)
            .join(", ")}</td></tr>
          <tr><th>Primary effect</th><td>${escapeHtml(spell.effects[0]?.name || "—")}</td></tr>
        </table>
      </aside>
    `;
  }

  function spellCard(spell) {
    return `
      <a class="spell-card" href="#/spell/${spell.id}">
        <div class="kicker">Tier ${spell.tier} · ${escapeHtml(spell.element)}</div>
        <h3>${escapeHtml(spell.name)}</h3>
        <p class="latin">${escapeHtml(spell.incantation)}</p>
        <p>${escapeHtml(spell.description.slice(0, 110))}…</p>
      </a>
    `;
  }

  function homeView() {
    setActiveNav("home");
    document.title = wikiName;
    page.innerHTML = `
      <h1 class="article-title">Main Page</h1>
      <p class="article-subtitle">Welcome to the Loreman's Spellbook, a record of spoken workings.</p>
      <p class="lede">This grimoire records every known spell from <strong>Level 1</strong> through <strong>Level 100</strong>. Each entry holds an incantation, classification fields, categories, listed effects, and a short account of the working. The first four pages are the primordial elements: Fire, Earth, Air, and Water — the words from which later tiers are expected to grow.</p>
      <hr class="ornament" />
      <div class="section">
        <h2>How the book is kept</h2>
        <ul>
          <li><strong>Tiers</strong> run from Level 1 to Level 100. Only Tier 1 is populated so far.</li>
          <li><strong>Incantations</strong> are Latin placeholders bound to the English name of the spell.</li>
          <li><strong>Classifications</strong> (School, Casting Method, Alignment, Rarity) are empty stubs.</li>
        </ul>
      </div>
      <div class="section">
        <h2>The Four Foundations</h2>
        <div class="home-grid">${spells.map(spellCard).join("")}</div>
      </div>
    `;
  }

  function spellsView() {
    setActiveNav("spells");
    document.title = `Spells — ${wikiName}`;
    page.innerHTML = `
      <h1 class="article-title">Spells</h1>
      <p class="article-subtitle">${spells.length} recorded working${spells.length === 1 ? "" : "s"} across tiers 1–${maxTier}.</p>
      <table class="wiki-table">
        <thead>
          <tr>
            <th>Spell</th>
            <th>Tier</th>
            <th>Incantation</th>
            <th>Category</th>
            <th>Primary effect</th>
          </tr>
        </thead>
        <tbody>
          ${spells
            .map(
              (spell) => `
            <tr>
              <td><a href="#/spell/${spell.id}">${escapeHtml(spell.name)}</a></td>
              <td><a href="#/tier/${spell.tier}">${spell.tier}</a></td>
              <td><em>${escapeHtml(spell.incantation)}</em></td>
              <td>${spell.categories.map((category) => `<a href="#/category/${slug(category)}">${escapeHtml(category)}</a>`).join(", ")}</td>
              <td>${escapeHtml(spell.effects[0]?.name || "—")}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    `;
  }

  function spellView(id) {
    const spell = byId[id];
    if (!spell) {
      page.innerHTML = `<h1 class="article-title">Missing page</h1><p>No spell is recorded under that name. Return to the <a href="#/spells">spell index</a>.</p>`;
      return;
    }
    setActiveNav("spells");
    document.title = `${spell.name} — ${wikiName}`;
    page.innerHTML = `
      ${infobox(spell)}
      <nav class="toc" aria-label="Contents">
        <strong>Contents</strong>
        <ol>
          <li><a href="#description">Description</a></li>
          <li><a href="#incantation">Incantation</a></li>
          <li><a href="#effects">Effects</a></li>
          <li><a href="#classifications">Classifications</a></li>
        </ol>
      </nav>
      <h1 class="article-title">${escapeHtml(spell.name)}</h1>
      <p class="article-subtitle">Tier ${spell.tier} primordial working · spoken <em>${escapeHtml(spell.incantation)}</em></p>
      <div class="section" id="description">
        <h2>Description</h2>
        <p>${escapeHtml(spell.description)}</p>
      </div>
      <div class="section" id="incantation">
        <h2>Incantation</h2>
        <p>The word of this spell is <strong>${escapeHtml(spell.incantation)}</strong>, Latin for <em>${escapeHtml(spell.incantationGloss)}</em>, chosen to sit beside the English name <em>${escapeHtml(spell.name)}</em>.</p>
      </div>
      <div class="section" id="effects">
        <h2>Effects</h2>
        <ul class="effects">
          ${spell.effects
            .map(
              (effect) =>
                `<li><strong>${escapeHtml(effect.name)}</strong>${escapeHtml(effect.summary)}</li>`
            )
            .join("")}
        </ul>
      </div>
      <div class="section" id="classifications">
        <h2>Classifications</h2>
        <div class="stub-box">This section is a placeholder. School, Casting Method, Alignment, and Rarity have not been assigned.</div>
      </div>
      <p class="cats"><strong>Categories:</strong> ${spell.categories
        .map((category) => `<a href="#/category/${slug(category)}">${escapeHtml(category)}</a>`)
        .join(" · ")}</p>
    `;
  }

  function tiersView() {
    setActiveNav("tiers");
    document.title = `Tiers — ${wikiName}`;
    const filled = new Set(spells.map((spell) => spell.tier));
    const cells = Array.from({ length: maxTier }, (_, index) => {
      const tier = index + 1;
      const isFilled = filled.has(tier);
      return `<a class="tier-cell${isFilled ? " filled" : ""}" href="#/tier/${tier}" title="Level ${tier}">${tier}</a>`;
    }).join("");
    page.innerHTML = `
      <h1 class="article-title">Spell Tiers</h1>
      <p class="article-subtitle">Levels 1 through ${maxTier}. Filled cells already have recorded spells.</p>
      <p>Every working in this book belongs to a single tier. Higher numbers mark rarer, heavier, or more demanding arts. The four primordial elements occupy <a href="#/tier/1">Level 1</a>; the remaining ninety-nine tiers are ready to be written.</p>
      <div class="tier-grid">${cells}</div>
    `;
  }

  function tierView(tier) {
    if (!Number.isInteger(tier) || tier < 1 || tier > maxTier) {
      page.innerHTML = `<h1 class="article-title">Unknown tier</h1><p>Tiers run from 1 to ${maxTier}. See the <a href="#/tiers">tier index</a>.</p>`;
      return;
    }
    setActiveNav("tiers");
    document.title = `Tier ${tier} — ${wikiName}`;
    const found = spellsInTier(tier);
    page.innerHTML = `
      <h1 class="article-title">Tier ${tier}</h1>
      <p class="article-subtitle">Level ${tier} of ${maxTier}</p>
      ${
        found.length
          ? `<p>${found.length} spell${found.length === 1 ? "" : "s"} recorded at this tier.</p>
             <div class="spell-grid">${found.map(spellCard).join("")}</div>`
          : `<div class="stub-box">No spells are recorded at Level ${tier} yet. This tier is a placeholder in the 1–${maxTier} ladder.</div>`
      }
      <p class="cats"><a href="#/tiers">All tiers</a></p>
    `;
  }

  function categoriesView() {
    setActiveNav("categories");
    document.title = `Categories — ${wikiName}`;
    const cats = allCategories();
    page.innerHTML = `
      <h1 class="article-title">Categories</h1>
      <p class="article-subtitle">Pages grouped by working type.</p>
      <table class="wiki-table">
        <thead><tr><th>Category</th><th>Spells</th></tr></thead>
        <tbody>
          ${cats
            .map((category) => {
              const group = spellsInCategory(category);
              return `<tr>
                <td><a href="#/category/${slug(category)}">${escapeHtml(category)}</a></td>
                <td>${group.map((spell) => `<a href="#/spell/${spell.id}">${escapeHtml(spell.name)}</a>`).join(", ")}</td>
              </tr>`;
            })
            .join("")}
        </tbody>
      </table>
    `;
  }

  function categoryView(id) {
    setActiveNav("categories");
    const match = allCategories().find((category) => slug(category) === id);
    if (!match) {
      page.innerHTML = `<h1 class="article-title">Unknown category</h1><p>See the <a href="#/categories">category index</a>.</p>`;
      return;
    }
    document.title = `Category:${match} — ${wikiName}`;
    const found = spellsInCategory(match);
    page.innerHTML = `
      <h1 class="article-title">Category: ${escapeHtml(match)}</h1>
      <p class="article-subtitle">${found.length} page${found.length === 1 ? "" : "s"} in this category.</p>
      <div class="spell-grid">${found.map(spellCard).join("")}</div>
    `;
  }

  function render() {
    const route = parseRoute();
    window.scrollTo(0, 0);
    if (route.name === "home") return homeView();
    if (route.name === "spells") return spellsView();
    if (route.name === "spell") return spellView(route.id);
    if (route.name === "tiers") return tiersView();
    if (route.name === "tier") return tierView(route.id);
    if (route.name === "categories") return categoriesView();
    if (route.name === "category") return categoryView(route.id);
    homeView();
  }

  function bindSearch() {
    function closeResults() {
      searchResults.classList.remove("open");
      searchResults.hidden = true;
    }

    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim().toLowerCase();
      if (!query) {
        closeResults();
        return;
      }
      const hits = spells.filter((spell) => {
        const hay = [spell.name, spell.incantation, spell.incantationGloss, spell.element, ...spell.categories]
          .join(" ")
          .toLowerCase();
        return hay.includes(query);
      });
      searchResults.hidden = false;
      searchResults.classList.add("open");
      searchResults.innerHTML = hits.length
        ? hits
            .map(
              (spell) =>
                `<a href="#/spell/${spell.id}">${escapeHtml(spell.name)} <span class="muted">· ${escapeHtml(spell.incantation)}</span></a>`
            )
            .join("")
        : `<div class="empty">No spells match “${escapeHtml(searchInput.value)}”.</div>`;
    });

    searchResults.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        closeResults();
        searchInput.value = "";
      }
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest(".search-box")) closeResults();
    });
  }

  foundationList.innerHTML = spells
    .map((spell) => `<li><a href="#/spell/${spell.id}">${escapeHtml(spell.name)}</a></li>`)
    .join("");

  bindSearch();
  window.addEventListener("hashchange", render);
  render();
})();
