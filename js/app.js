(function () {
  const { spells, maxTier, classificationSlots, wikiName } = window.SPELLBOOK;

  const page = document.getElementById("page");
  const searchInput = document.getElementById("spell-search");
  const searchResults = document.getElementById("search-results");
  const foundationList = document.getElementById("foundation-list");

  const byId = Object.fromEntries(spells.map((spell) => [spell.id, spell]));
  const SITE_URL = "https://theloreman.com";
  const DEFAULT_DESCRIPTION =
    "The Loreman's Spellbook is a grimoire of spoken workings from tier 1 to 100. Browse Fire, Earth, Air, and Water — the four primordial elemental spells.";
  const DEFAULT_JSON_LD = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: wikiName,
    url: `${SITE_URL}/`,
    description: DEFAULT_DESCRIPTION,
    inLanguage: "en",
    author: {
      "@type": "Person",
      name: "Cristian Paez Jr",
      url: "https://www.iamchrispaezjr.com",
    },
  };

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

  function clipMeta(text, max = 158) {
    const clean = String(text).replace(/\s+/g, " ").trim();
    if (clean.length <= max) return clean;
    return `${clean.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
  }

  function setMeta(name, content, attr = "name") {
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  }

  function setSeo({ title, description, path, type = "website", jsonLd = DEFAULT_JSON_LD }) {
    const url = `${SITE_URL}/${path || ""}`.replace(/([^:]\/)\/+/g, "$1");
    const desc = clipMeta(description || DEFAULT_DESCRIPTION);
    document.title = title;
    setMeta("description", desc);
    setMeta("og:title", title, "property");
    setMeta("og:description", desc, "property");
    setMeta("og:url", url, "property");
    setMeta("og:type", type, "property");
    setMeta("twitter:title", title);
    setMeta("twitter:description", desc);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", url);
    const structured = document.getElementById("structured-data");
    if (structured) structured.textContent = JSON.stringify(jsonLd);
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
    if (parts[0] === "privacy") return { name: "privacy" };
    if (parts[0] === "terms") return { name: "terms" };
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
    setSeo({
      title: wikiName,
      description: DEFAULT_DESCRIPTION,
      path: "",
    });
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
    setSeo({
      title: `Spells — ${wikiName}`,
      description: `Browse ${spells.length} recorded workings in The Loreman's Spellbook, from tier 1 through ${maxTier}. Fire, Earth, Air, and Water are cataloged so far.`,
      path: "#/spells",
    });
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
      setSeo({
        title: `Missing page — ${wikiName}`,
        description: DEFAULT_DESCRIPTION,
        path: `#/spell/${id}`,
      });
      page.innerHTML = `<h1 class="article-title">Missing page</h1><p>No spell is recorded under that name. Return to the <a href="#/spells">spell index</a>.</p>`;
      return;
    }
    setActiveNav("spells");
    setSeo({
      title: `${spell.name} — ${wikiName}`,
      description: spell.description,
      path: `#/spell/${spell.id}`,
      type: "article",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: `${spell.name} (${spell.incantation})`,
        description: clipMeta(spell.description),
        url: `${SITE_URL}/#/spell/${spell.id}`,
        isPartOf: { "@type": "WebSite", name: wikiName, url: `${SITE_URL}/` },
      },
    });
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
    setSeo({
      title: `Tiers — ${wikiName}`,
      description: `Spell tiers from level 1 to ${maxTier} in The Loreman's Spellbook. Tier 1 holds the four primordial elemental workings.`,
      path: "#/tiers",
    });
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
      setSeo({
        title: `Unknown tier — ${wikiName}`,
        description: DEFAULT_DESCRIPTION,
        path: `#/tier/${tier}`,
      });
      page.innerHTML = `<h1 class="article-title">Unknown tier</h1><p>Tiers run from 1 to ${maxTier}. See the <a href="#/tiers">tier index</a>.</p>`;
      return;
    }
    setActiveNav("tiers");
    setSeo({
      title: `Tier ${tier} — ${wikiName}`,
      description: `Spells recorded at tier ${tier} of ${maxTier} in The Loreman's Spellbook.`,
      path: `#/tier/${tier}`,
    });
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
    setSeo({
      title: `Categories — ${wikiName}`,
      description: "Browse spells by category in The Loreman's Spellbook, including Elemental, Primordial, Offensive, Defensive, Utility, and Support.",
      path: "#/categories",
    });
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
      setSeo({
        title: `Unknown category — ${wikiName}`,
        description: DEFAULT_DESCRIPTION,
        path: `#/category/${id}`,
      });
      page.innerHTML = `<h1 class="article-title">Unknown category</h1><p>See the <a href="#/categories">category index</a>.</p>`;
      return;
    }
    setSeo({
      title: `Category:${match} — ${wikiName}`,
      description: `Spells in the ${match} category of The Loreman's Spellbook.`,
      path: `#/category/${id}`,
    });
    const found = spellsInCategory(match);
    page.innerHTML = `
      <h1 class="article-title">Category: ${escapeHtml(match)}</h1>
      <p class="article-subtitle">${found.length} page${found.length === 1 ? "" : "s"} in this category.</p>
      <div class="spell-grid">${found.map(spellCard).join("")}</div>
    `;
  }

  function privacyView() {
    setActiveNav("");
    setSeo({
      title: `Privacy Policy — ${wikiName}`,
      description: "How The Loreman's Spellbook handles donations, advertising, analytics, and other information collected on theloreman.com.",
      path: "#/privacy",
    });
    page.innerHTML = `
      <h1 class="article-title">Privacy Policy</h1>
      <p class="article-subtitle">Effective September 4, 2026</p>
      <div class="legal">
        <p>The Loreman's Spellbook (“the site,” “we,” “us”) is operated by Cristian Paez Jr and owned by Cristian Paez Jr &amp; Co. It is published at <a href="https://theloreman.com/">theloreman.com</a>. This policy explains what information is collected when you visit, donate, or see ads on the site.</p>

        <h2>What this site does</h2>
        <p>The site is a public grimoire of fictional spell lore. It currently displays third-party advertisements and accepts voluntary donations. It also uses analytics to understand how the site is used.</p>

        <h2>Information we collect</h2>
        <ul>
          <li><strong>Usage data.</strong> Google Analytics (measurement ID G-6ZY7LZ5NB1) records things such as pages viewed, approximate location, device and browser type, and referral source.</li>
          <li><strong>Advertising data.</strong> Google AdSense (publisher ID pub-7643949929679794) displays ads and may collect or receive cookie and device identifiers, IP address, and browsing data to show and measure ads, including personalized ads where allowed.</li>
          <li><strong>Donation data.</strong> If you donate, the payment is processed by PayPal. We do not collect or store your full payment card number on this site. PayPal may share with us your name, email address, and donation amount so we can acknowledge the gift.</li>
          <li><strong>Local site preferences.</strong> The site may store simple settings in your browser (for example, whether the watching eye stays pinned) using local storage. That data stays on your device.</li>
        </ul>

        <h2>Donations</h2>
        <p>Donations are optional. They are processed by PayPal according to <a href="https://www.paypal.com/us/legalhub/privacy-full" target="_blank" rel="noopener noreferrer">PayPal’s Privacy Statement</a>. We use donation information only to receive the gift, send thanks if appropriate, and keep ordinary records. Donations are not required to use the spellbook.</p>

        <h2>Advertising</h2>
        <p>The site currently displays ads served by Google AdSense. Google and its partners may use cookies or similar technologies to serve ads based on your visits to this site and other sites. You can learn how Google uses information from partner sites in <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">Google’s partner sites policy</a>, and you can opt out of personalized ads at <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.</p>

        <h2>How we use information</h2>
        <p>We use the information above to run and improve the site, show ads, accept donations, measure traffic, keep the site secure, and comply with the law. We do not sell your personal information.</p>

        <h2>Sharing</h2>
        <p>We share information with service providers who help operate the site, including Google (analytics and ads) and PayPal (donations). Those companies handle data under their own policies. We may also disclose information if required by law or to protect the site and its visitors.</p>

        <h2>Cookies</h2>
        <p>Cookies and similar technologies may be set by this site, Google Analytics, and Google AdSense. You can block or delete cookies in your browser. Blocking them may affect ads, analytics, or saved preferences.</p>

        <h2>Children</h2>
        <p>The site is not directed at children under 13, and we do not knowingly collect personal information from children under 13.</p>

        <h2>Your choices</h2>
        <p>You can refuse cookies, use analytics or ads opt-outs offered by Google, and choose not to donate. Because this is a static site, we do not provide an account dashboard. For a privacy question, contact Cristian Paez Jr or Cristian Paez Jr &amp; Co. through <a href="https://www.iamchrispaezjr.com">iamchrispaezjr.com</a>.</p>

        <h2>Changes</h2>
        <p>We may update this policy as the site, ads, or donation setup changes. The effective date at the top will be revised when we do.</p>
      </div>
    `;
  }

  function termsView() {
    setActiveNav("");
    setSeo({
      title: `Terms of Service — ${wikiName}`,
      description: "Terms for using The Loreman's Spellbook, including voluntary donations and advertising displayed on theloreman.com.",
      path: "#/terms",
    });
    page.innerHTML = `
      <h1 class="article-title">Terms of Service</h1>
      <p class="article-subtitle">Effective September 4, 2026</p>
      <div class="legal">
        <p>These terms govern your use of The Loreman's Spellbook at <a href="https://theloreman.com/">theloreman.com</a>. The site is operated by Cristian Paez Jr and owned by Cristian Paez Jr &amp; Co. By using the site, you agree to these terms and to the <a href="#/privacy">Privacy Policy</a>.</p>

        <h2>The site</h2>
        <p>The Loreman's Spellbook is a work of fiction and creative reference. Spell entries, incantations, and related lore are for entertainment and world-building. They are not real-world instructions, medical advice, or any promise of results.</p>

        <h2>Donations</h2>
        <p>The site collects voluntary donations through PayPal. A donation is a gift. It does not buy merchandise, membership, extra features, or any ownership interest in the site, and it does not create a contract for future work unless we agree to that separately in writing. We do not represent that donations are tax-deductible. PayPal’s own terms apply to the payment itself.</p>

        <h2>Advertising</h2>
        <p>The site currently displays advertisements, including ads served by Google AdSense. Ads are provided by third parties. We do not control every advertiser’s content, and a listing or ad is not an endorsement. Clicking an ad may take you to another site with its own terms and privacy practices.</p>

        <h2>Intellectual property</h2>
        <p>Unless noted otherwise, the site’s original text, design, and arrangement are owned by Cristian Paez Jr &amp; Co. You may browse and share links to public pages. You may not copy the site wholesale, scrape it for a competing product, or present the material as your own without permission.</p>

        <h2>Acceptable use</h2>
        <p>Do not misuse the site, attempt to break it, interfere with ads or donations, or use it for unlawful purposes. We may change, suspend, or stop offering any part of the site at any time.</p>

        <h2>No warranty</h2>
        <p>The site is provided “as is.” We do not warrant that it will be uninterrupted, error-free, or that ads, donation checkout, or third-party services will always work. Fictional spell material is offered for reading, not as a guarantee of any kind.</p>

        <h2>Limitation of liability</h2>
        <p>To the fullest extent allowed by law, Cristian Paez Jr, Cristian Paez Jr &amp; Co., and The Loreman's Spellbook are not liable for indirect, incidental, or consequential damages arising from your use of the site, ads, or donations. Our total liability for any claim related to the site is limited to the amount you donated to us in the twelve months before the claim, if any.</p>

        <h2>Third-party services</h2>
        <p>PayPal, Google, and linked social or personal sites are independent services. Your use of those services is between you and those providers.</p>

        <h2>Changes</h2>
        <p>We may update these terms as donations, advertising, or the site itself change. Continued use after an update means you accept the revised terms. The effective date at the top will be revised when we do.</p>

        <h2>Contact</h2>
        <p>Questions about these terms can be sent through <a href="https://www.iamchrispaezjr.com">iamchrispaezjr.com</a>.</p>
      </div>
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
    if (route.name === "privacy") return privacyView();
    if (route.name === "terms") return termsView();
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
  window.addEventListener("hashchange", () => {
    render();
    if (typeof gtag === "function") {
      gtag("event", "page_view", {
        page_title: document.title,
        page_location: location.href,
      });
    }
  });
  render();
})();
