// RE-Skills Application Logic
(function () {
  "use strict";

  // ── State ──────────────────────────────────────────────
  const state = {
    search: "",
    phase: "all",
    type: "all"
  };

  // ── Type color mapping ─────────────────────────────────
  const TYPE_COLORS = {
    component: { bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-500", border: "border-blue-200" },
    interactive: { bg: "bg-amber-100", text: "text-amber-800", dot: "bg-amber-500", border: "border-amber-200" },
    workflow: { bg: "bg-purple-100", text: "text-purple-800", dot: "bg-purple-500", border: "border-purple-200" }
  };

  // ── Helper: human-readable type label ──────────────────
  function typeLabel(type) {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  // ── Render phase cards ─────────────────────────────────
  function renderPhaseCards() {
    const container = document.getElementById("phase-grid");
    container.innerHTML = PHASES.map(phase => {
      const count = SKILLS.filter(s => s.phase === phase.id).length;
      return `
        <button onclick="filterByPhase('${phase.id}')" class="phase-card bg-white border border-slate-200 rounded-xl p-5 text-left hover:border-indigo-300 group">
          <div class="flex items-center gap-3 mb-3">
            <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-sm">${phase.number}</span>
            <span class="text-xs font-medium text-slate-500">${count} skills</span>
          </div>
          <h3 class="font-semibold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">${phase.id}</h3>
          <p class="text-sm text-slate-500 leading-snug">${phase.description}</p>
        </button>
      `;
    }).join("");
  }

  // ── Render phase filter buttons ────────────────────────
  function renderPhaseFilterButtons() {
    const container = document.getElementById("phase-filter-buttons");
    container.innerHTML = PHASES.map(phase => {
      const count = SKILLS.filter(s => s.phase === phase.id).length;
      return `<button onclick="togglePhaseFilter('${phase.id}')" class="phase-filter-btn px-3 py-1.5 rounded-full text-xs font-medium transition-all" data-phase="${phase.id}">${phase.id} (${count})</button>`;
    }).join("");
  }

  // ── Render skill cards ─────────────────────────────────
  function renderSkillCards() {
    const filtered = getFilteredSkills();
    const container = document.getElementById("skills-grid");
    const emptyState = document.getElementById("empty-state");
    const countEl = document.getElementById("results-count");

    countEl.textContent = filtered.length;

    if (filtered.length === 0) {
      container.classList.add("hidden");
      emptyState.classList.remove("hidden");
      return;
    }

    container.classList.remove("hidden");
    emptyState.classList.add("hidden");

    container.innerHTML = filtered.map(skill => {
      const tc = TYPE_COLORS[skill.type];
      return `
        <div class="skill-card bg-white border border-slate-200 rounded-xl p-5 flex flex-col" onclick="openModal('${skill.id}')" role="button" tabindex="0" onkeydown="if(event.key==='Enter')openModal('${skill.id}')">
          <div class="flex items-center gap-2 mb-3 flex-wrap">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${tc.bg} ${tc.text}">${typeLabel(skill.type)}</span>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">${skill.phase}</span>
          </div>
          <h3 class="font-semibold text-slate-900 mb-2 text-sm">${skill.name}</h3>
          <p class="text-sm text-slate-500 line-clamp-2 flex-1 leading-relaxed">${skill.description}</p>
          <div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs text-slate-400 flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              ${skill.estimatedTime}
            </span>
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </div>
        </div>
      `;
    }).join("");
  }

  // ── Render command cards ───────────────────────────────
  function renderCommandCards() {
    const container = document.getElementById("commands-grid");
    container.innerHTML = COMMANDS.map(cmd => {
      return `
        <div class="command-card bg-white border border-slate-200 rounded-xl p-5 cursor-pointer" onclick="toggleCommand('${cmd.id}')">
          <div class="flex items-center justify-between mb-3">
            <code class="font-mono text-sm font-semibold text-indigo-600">${cmd.name}</code>
            <svg class="w-4 h-4 text-slate-400 command-chevron transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </div>
          <p class="text-sm text-slate-600 mb-3 leading-relaxed">${cmd.description}</p>
          <div class="flex gap-3 text-xs text-slate-500">
            <span class="flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
              ${cmd.uses.length} skills
            </span>
            <span class="flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              ${cmd.outputs.length} outputs
            </span>
          </div>
          <!-- Expandable details -->
          <div class="command-details mt-0" id="cmd-details-${cmd.id}">
            <div class="mt-4 pt-4 border-t border-slate-200 space-y-4">
              <div>
                <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Skills Used</h4>
                <div class="flex flex-wrap gap-1.5">
                  ${cmd.uses.map(skillId => {
                    const skill = SKILLS.find(s => s.id === skillId);
                    if (!skill) return `<span class="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs">${skillId}</span>`;
                    const tc = TYPE_COLORS[skill.type];
                    return `<button class="px-2 py-1 rounded-md ${tc.bg} ${tc.text} text-xs font-medium hover:opacity-80 transition-opacity" onclick="event.stopPropagation();openModal('${skill.id}')">${skill.name}</button>`;
                  }).join("")}
                </div>
              </div>
              <div>
                <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Outputs</h4>
                <ul class="space-y-1">
                  ${cmd.outputs.map(o => `<li class="text-sm text-slate-600 flex items-start gap-2"><svg class="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>${o}</li>`).join("")}
                </ul>
              </div>
              <div>
                <span class="text-xs text-slate-400">Argument: </span>
                <code class="text-xs text-slate-600 font-mono">${cmd.argumentHint}</code>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  // ── Filter logic ───────────────────────────────────────
  function getFilteredSkills() {
    return SKILLS.filter(skill => {
      if (state.type !== "all" && skill.type !== state.type) return false;
      if (state.phase !== "all" && skill.phase !== state.phase) return false;
      if (state.search) {
        const q = state.search.toLowerCase();
        const haystack = (skill.name + " " + skill.description + " " + skill.id).toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }

  // ── Filter actions (global) ────────────────────────────
  window.toggleTypeFilter = function (type) {
    state.type = type;
    updateFilterButtons();
    renderSkillCards();
  };

  window.togglePhaseFilter = function (phase) {
    state.phase = phase;
    updateFilterButtons();
    renderSkillCards();
  };

  window.filterByType = function (type) {
    state.type = type;
    state.phase = "all";
    state.search = "";
    document.getElementById("search-input").value = "";
    updateFilterButtons();
    renderSkillCards();
    document.getElementById("skills").scrollIntoView({ behavior: "smooth" });
  };

  window.filterByPhase = function (phase) {
    state.phase = phase;
    state.type = "all";
    state.search = "";
    document.getElementById("search-input").value = "";
    updateFilterButtons();
    renderSkillCards();
    document.getElementById("skills").scrollIntoView({ behavior: "smooth" });
  };

  window.resetFilters = function () {
    state.search = "";
    state.type = "all";
    state.phase = "all";
    document.getElementById("search-input").value = "";
    updateFilterButtons();
    renderSkillCards();
  };

  function updateFilterButtons() {
    document.querySelectorAll(".type-filter-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.type === state.type);
    });
    document.querySelectorAll(".phase-filter-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.phase === state.phase);
    });
  }

  // ── Search ─────────────────────────────────────────────
  let searchTimeout;
  function handleSearch(e) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.search = e.target.value.trim();
      renderSkillCards();
    }, 150);
  }

  // ── Modal ──────────────────────────────────────────────
  window.openModal = function (skillId) {
    const skill = SKILLS.find(s => s.id === skillId);
    if (!skill) return;

    const tc = TYPE_COLORS[skill.type];

    document.getElementById("modal-title").textContent = skill.name;
    document.getElementById("modal-badges").innerHTML = `
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${tc.bg} ${tc.text}">${typeLabel(skill.type)}</span>
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">${skill.phase}</span>
    `;
    document.getElementById("modal-intent").textContent = skill.intent;

    // Best for
    const bestForEl = document.getElementById("modal-bestfor");
    const bestForSection = document.getElementById("modal-bestfor-section");
    if (skill.bestFor && skill.bestFor.length) {
      bestForSection.classList.remove("hidden");
      bestForEl.innerHTML = skill.bestFor.map(b =>
        `<li class="text-sm text-slate-700 flex items-start gap-2">
          <svg class="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          ${b}
        </li>`
      ).join("");
    } else {
      bestForSection.classList.add("hidden");
    }

    // Scenarios
    const scenariosEl = document.getElementById("modal-scenarios");
    const scenariosSection = document.getElementById("modal-scenarios-section");
    if (skill.scenarios && skill.scenarios.length) {
      scenariosSection.classList.remove("hidden");
      scenariosEl.innerHTML = skill.scenarios.map(s =>
        `<li class="text-sm text-slate-600 italic flex items-start gap-2">
          <span class="text-slate-400 flex-shrink-0">"</span>
          ${s}
        </li>`
      ).join("");
    } else {
      scenariosSection.classList.add("hidden");
    }

    // Time
    const timeSection = document.getElementById("modal-time-section");
    if (skill.estimatedTime) {
      timeSection.classList.remove("hidden");
      document.getElementById("modal-time").querySelector("span").textContent = skill.estimatedTime;
    } else {
      timeSection.classList.add("hidden");
    }

    // Related commands
    const relatedCmds = COMMANDS.filter(cmd => cmd.uses.includes(skill.id));
    const cmdsSection = document.getElementById("modal-commands-section");
    const cmdsEl = document.getElementById("modal-commands");
    if (relatedCmds.length) {
      cmdsSection.classList.remove("hidden");
      cmdsEl.innerHTML = relatedCmds.map(cmd =>
        `<span class="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-mono font-medium">${cmd.name}</span>`
      ).join("");
    } else {
      cmdsSection.classList.add("hidden");
    }

    // GitHub link
    document.getElementById("modal-github-link").href = GITHUB_BASE + skill.path;

    // Show modal
    const overlay = document.getElementById("modal-overlay");
    overlay.classList.remove("hidden");
    requestAnimationFrame(() => {
      overlay.classList.add("visible");
    });
    document.body.style.overflow = "hidden";
  };

  window.closeModal = function () {
    const overlay = document.getElementById("modal-overlay");
    overlay.classList.remove("visible");
    setTimeout(() => {
      overlay.classList.add("hidden");
    }, 200);
    document.body.style.overflow = "";
  };

  // Escape key to close modal
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !document.getElementById("modal-overlay").classList.contains("hidden")) {
      closeModal();
    }
  });

  // ── Command expand/collapse ────────────────────────────
  window.toggleCommand = function (cmdId) {
    const details = document.getElementById("cmd-details-" + cmdId);
    const card = details.closest(".command-card");
    const chevron = card.querySelector(".command-chevron");
    const isExpanded = details.classList.contains("expanded");

    // Close all others
    document.querySelectorAll(".command-details.expanded").forEach(d => {
      d.classList.remove("expanded");
      d.closest(".command-card").querySelector(".command-chevron").style.transform = "";
    });

    if (!isExpanded) {
      details.classList.add("expanded");
      chevron.style.transform = "rotate(180deg)";
    }
  };

  // ── Navigation highlight ───────────────────────────────
  function setupScrollSpy() {
    const sections = ["hero", "phases", "skills", "commands"];
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            document.querySelectorAll(".nav-link").forEach(link => {
              link.classList.toggle("active", link.dataset.section === entry.target.id);
            });
          }
        });
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  // ── Mobile menu ────────────────────────────────────────
  window.closeMobileMenu = function () {
    document.getElementById("mobile-menu").classList.add("hidden");
    document.getElementById("menu-icon-open").classList.remove("hidden");
    document.getElementById("menu-icon-close").classList.add("hidden");
  };

  function setupMobileMenu() {
    const btn = document.getElementById("mobile-menu-btn");
    const menu = document.getElementById("mobile-menu");
    btn.addEventListener("click", () => {
      const isHidden = menu.classList.contains("hidden");
      menu.classList.toggle("hidden");
      document.getElementById("menu-icon-open").classList.toggle("hidden", isHidden);
      document.getElementById("menu-icon-close").classList.toggle("hidden", !isHidden);
    });
  }

  // ── Smooth scroll for nav links ────────────────────────
  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener("click", function (e) {
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth" });
        }
      });
    });
  }

  // ── Initialize ─────────────────────────────────────────
  function init() {
    renderPhaseCards();
    renderPhaseFilterButtons();
    renderSkillCards();
    renderCommandCards();
    setupScrollSpy();
    setupMobileMenu();
    setupSmoothScroll();

    document.getElementById("search-input").addEventListener("input", handleSearch);

    // Parse URL hash for initial filter state
    const hash = window.location.hash;
    if (hash.includes("type=")) {
      const match = hash.match(/type=(\w+)/);
      if (match) state.type = match[1];
    }
    if (hash.includes("phase=")) {
      const match = hash.match(/phase=([\w-]+)/);
      if (match) state.phase = match[1];
    }
    if (state.type !== "all" || state.phase !== "all") {
      updateFilterButtons();
      renderSkillCards();
    }
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
