import { t, loc, getLang, setLang, detectLang, LANGS } from "./i18n.js";
import { createDeck } from "./engine.js";
import * as bet from "./games/bet.js";
import * as betView from "./views/bet-view.js";
import * as court from "./games/court.js";
import * as courtView from "./views/court-view.js";

const GAMES = {
  bet: { logic: bet, view: betView, content: "content/bet.json", nameKey: "betName", descKey: "betDesc" },
  court: { logic: court, view: courtView, content: "content/court.json", nameKey: "courtName", descKey: "courtDesc" },
};

const app = document.getElementById("app");

const state = {
  screen: "start",
  players: ["", ""],
  gameId: null,
  content: {},
  selected: [],
  deck: [],
  deckPos: 0,
  roundNumber: 0,
  round: null,
  prevRound: null,
  menuEntry: null,
  error: null,
};

function esc(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function name(index) {
  return state.players[index].trim() || t(index === 0 ? "player1" : "player2");
}

const ctx = { t, loc, name, esc };

function render() {
  document.documentElement.lang = getLang() === "pt" ? "pt-BR" : "en";
  document.title = t("appTitle");
  app.classList.remove("menu-open");
  app.innerHTML = screens[state.screen]();
}

// Toggled without re-rendering so a half-typed answer survives opening the menu.
function setMenu(open) {
  app.classList.toggle("menu-open", open);
  const drawer = app.querySelector(".drawer");
  if (drawer) drawer.inert = !open;
}

// Screens opened from the in-game menu go back to the game instead of the previous setup step.
function backBar(screen) {
  const target = state.menuEntry === state.screen ? "play" : screen;
  return `
    <header class="topbar">
      <button class="btn ghost small" data-action="go" data-screen="${target}">‹ ${t("back")}</button>
    </header>`;
}

function backStepButton(visible = true) {
  return `<button class="btn ghost small" data-action="back-step" ${visible ? "" : 'style="visibility:hidden" tabindex="-1"'}>‹ ${t("back")}</button>`;
}

const screens = {
  start: () => `
    ${state.menuEntry === "start" ? backBar("start") : ""}
    <section class="screen center">
      <div class="lang-toggle" role="group">
        ${LANGS.map((l) => `<button class="chip small" data-action="lang" data-lang="${l}" aria-pressed="${l === getLang()}">${l.toUpperCase()}</button>`).join("")}
      </div>
      <h1 class="title">${t("appTitle")}</h1>
      <p class="tagline">${t("tagline")}</p>
      <button class="btn primary" data-action="go" data-screen="names">${t("start")}</button>
    </section>`,

  names: () => `
    ${backBar("start")}
    <section class="screen center">
      <h1>${t("namesTitle")}</h1>
      <form data-form="names" class="stack">
        ${[0, 1].map((i) => `
          <input name="p${i}" value="${esc(state.players[i])}" placeholder="${t(i === 0 ? "player1" : "player2")}"
            maxlength="20" autocomplete="off" autocorrect="off" spellcheck="false" aria-label="${t(i === 0 ? "player1" : "player2")}">`).join("")}
        <button class="btn primary" type="submit">${t("continue")}</button>
      </form>
    </section>`,

  choose: () => `
    ${backBar("names")}
    <section class="screen center">
      <h1>${t("chooseTitle")}</h1>
      <div class="stack">
        ${Object.entries(GAMES).map(([id, g]) => `
          <button class="game-card" data-action="choose" data-game="${id}" ${g.comingSoon ? "disabled" : ""}>
            <span class="game-name">${t(g.nameKey)}</span>
            <span class="game-desc">${g.comingSoon ? t("comingSoon") : t(g.descKey)}</span>
          </button>`).join("")}
      </div>
      ${state.error ? `<p class="error">${t("loadError")}</p>` : ""}
    </section>`,

  loading: () => `<section class="screen center"><p>${t("loading")}</p></section>`,

  categories: () => {
    const { categories } = state.content[state.gameId];
    return `
      ${backBar("choose")}
      <section class="screen center">
        <h1>${t("categoriesTitle")}</h1>
        <div class="chips">
          ${categories.map((c) => `<button class="chip" data-action="toggle-category" data-category="${esc(c.id)}" aria-pressed="${state.selected.includes(c.id)}">${esc(loc(c.name))}</button>`).join("")}
        </div>
        <button class="btn primary" data-action="play" ${state.selected.length ? "" : "disabled"}>${t("play")}</button>
      </section>`;
  },

  play: () => `
    <header class="topbar">
      ${backStepButton(GAMES[state.gameId].logic.canGoBack(state.round))}
      <span class="topbar-title">${t(GAMES[state.gameId].nameKey)}</span>
      <button class="btn ghost small" data-action="open-menu" aria-controls="menu">${t("menu")}</button>
    </header>
    ${GAMES[state.gameId].view.render(state.round, ctx)}
    ${menu()}`,

  exhausted: () => `
    <header class="topbar">${backStepButton()}</header>
    <section class="screen center">
      <h1>${t("exhaustedTitle")}</h1>
      <div class="stack">
        <button class="btn primary" data-action="reshuffle">${t("reshuffle")}</button>
        <button class="btn" data-action="go" data-screen="categories">${t("changeCategories")}</button>
        <button class="btn ghost" data-action="go" data-screen="choose">${t("switchGame")}</button>
      </div>
    </section>`,
};

function menu() {
  return `
    <div class="drawer-backdrop" data-action="close-menu"></div>
    <aside class="drawer" id="menu" inert>
      <button class="drawer-close" data-action="close-menu" aria-label="${t("close")}">×</button>
      <nav class="stack">
        <button class="btn" data-action="go" data-from="menu" data-screen="categories">${t("changeCategories")}</button>
        <button class="btn" data-action="go" data-from="menu" data-screen="choose">${t("switchGame")}</button>
        <button class="btn ghost" data-action="go" data-from="menu" data-screen="start">${t("newGame")}</button>
      </nav>
    </aside>`;
}

async function chooseGame(gameId) {
  state.gameId = gameId;
  state.menuEntry = null;
  state.error = null;
  if (!state.content[gameId]) {
    state.screen = "loading";
    render();
    try {
      const res = await fetch(GAMES[gameId].content);
      if (!res.ok) throw new Error(res.statusText);
      state.content[gameId] = await res.json();
    } catch {
      state.error = true;
      state.screen = "choose";
      return render();
    }
  }
  state.selected = state.content[gameId].categories.map((c) => c.id);
  state.screen = "categories";
  render();
}

function startDeck() {
  state.deck = createDeck(state.content[state.gameId].items, state.selected);
  state.deckPos = 0;
  state.roundNumber = 0;
  state.round = null;
  state.menuEntry = null;
  nextRound();
}

function nextRound() {
  if (state.deckPos >= state.deck.length) {
    state.screen = "exhausted";
    return render();
  }
  state.prevRound = state.round;
  state.roundNumber += 1;
  state.round = GAMES[state.gameId].logic.createRound(state.deck[state.deckPos++], state.roundNumber, state.content[state.gameId]);
  state.screen = "play";
  render();
}

function dispatchGame(action) {
  document.activeElement?.blur();
  state.round = GAMES[state.gameId].logic.advance(state.round, action);
  render();
  window.scrollTo(0, 0);
}

function stepBack() {
  document.activeElement?.blur();
  if (state.screen === "exhausted") {
    state.screen = "play";
    return render();
  }
  const previous = GAMES[state.gameId].logic.back(state.round);
  if (previous) {
    state.round = previous;
  } else if (state.prevRound) {
    state.round = state.prevRound;
    state.prevRound = null;
    state.deckPos -= 1;
    state.roundNumber -= 1;
  } else {
    state.screen = "categories";
  }
  render();
}

app.addEventListener("click", (event) => {
  const el = event.target.closest("[data-action]");
  if (!el || el.disabled) return;
  const { action } = el.dataset;
  switch (action) {
    case "lang":
      setLang(el.dataset.lang);
      return render();
    case "go":
      state.menuEntry = el.dataset.from === "menu" ? el.dataset.screen : null;
      state.screen = el.dataset.screen;
      return render();
    case "choose":
      return chooseGame(el.dataset.game);
    case "toggle-category": {
      const id = el.dataset.category;
      state.selected = state.selected.includes(id) ? state.selected.filter((c) => c !== id) : [...state.selected, id];
      return render();
    }
    case "play":
    case "reshuffle":
      return startDeck();
    case "open-menu":
      return setMenu(true);
    case "close-menu":
      return setMenu(false);
    case "game":
      return dispatchGame({ type: el.dataset.type, verdict: el.dataset.verdict });
    case "next-round":
      return nextRound();
    case "back-step":
      return stepBack();
  }
});

app.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  if (form.dataset.form === "names") {
    state.players = [form.elements.p0.value, form.elements.p1.value];
    state.screen = "choose";
    return render();
  }
  if (form.dataset.form === "answer") {
    dispatchGame({ type: "submit", text: form.elements.text.value });
  }
});

app.addEventListener("keydown", (event) => {
  if (event.key === "Escape") return setMenu(false);
  if (event.key === "Enter" && !event.shiftKey && event.target.matches("form[data-form='answer'] textarea")) {
    event.preventDefault();
    event.target.form.requestSubmit();
  }
});

window.addEventListener("beforeunload", (event) => {
  if (state.screen === "play") event.preventDefault();
});

setLang(detectLang());
render();
