import { second, revealed, outcome } from "../games/court.js";
import { handoff, placeDown } from "./common.js";

const VERDICT_KEYS = { guilty: "guilty", not_guilty: "notGuilty" };

export function render(round, { t, loc, name, esc }) {
  const first = esc(name(round.first));
  const other = esc(name(second(round)));
  const item = round.case;
  const caseNo = esc(item.id.split("_").pop());
  const title = esc(loc(item.title));
  const question = esc(loc(item.question));
  const eyebrow = t("caseN", { n: caseNo });

  switch (round.phase) {
    case "intro":
      return `
        <section class="screen">
          <p class="eyebrow">${eyebrow}</p>
          <h1>${title}</h1>
          <p class="scenario">${esc(loc(item.scenario))}</p>
          <h2 class="prompt">${question}</h2>
          <button class="btn primary" data-action="game" data-type="begin">${t("votePrivately", { name: first })}</button>
        </section>`;
    case "handoff-first":
      return handoff(t("passTo", { name: first }), t("courtRevoteHandoff", { name: first }), t("imName", { name: first }), eyebrow);
    case "handoff-second":
      return handoff(t("passTo", { name: other }), t("courtHandoffSecond", { name: other }), t("imName", { name: other }), eyebrow);
    case "vote-first":
      return vote(first, title, question, t);
    case "vote-second":
      return vote(other, title, question, t);
    case "ready":
      return placeDown(t);
    case "reveal":
      return reveal(round, { t, name, esc, title, eyebrow });
    case "debate": {
      const total = round.debatePrompts.length;
      return `
        <section class="screen">
          <p class="banner">${t("courtInSession")}</p>
          <p class="eyebrow">${round.debateIndex + 1} / ${total}</p>
          <h1 class="prompt big">${esc(loc(round.debatePrompts[round.debateIndex]))}</h1>
          <div class="stack push-down">
            <button class="btn primary" data-action="game" data-type="next">${t("nextPrompt")}</button>
            <button class="btn ghost" data-action="game" data-type="skip">${t("skipDebate")}</button>
          </div>
        </section>`;
    }
    case "final":
      return `
        <section class="screen center">
          <p class="eyebrow">${t("finalQuestion")}</p>
          <h1>${t("positionChanged")}</h1>
          <div class="stack">
            ${round.revoted ? "" : `<button class="btn primary" data-action="game" data-type="revote">${t("revote")}</button>`}
            <button class="btn${round.revoted ? " primary" : ""}" data-action="next-round">${t("nextCase")}</button>
          </div>
        </section>`;
  }
  return "";
}

function vote(player, title, question, t) {
  return `
    <section class="screen">
      <p class="banner">${t("yourVerdict")}</p>
      <p class="player-tag">${player}</p>
      <p class="eyebrow">${title}</p>
      <h2 class="prompt">${question}</h2>
      <div class="stack push-down">
        <button class="btn verdict guilty" data-action="game" data-type="vote" data-verdict="guilty">${t("guilty")}</button>
        <button class="btn verdict not-guilty" data-action="game" data-type="vote" data-verdict="not_guilty">${t("notGuilty")}</button>
      </div>
    </section>`;
}

function reveal(round, { t, name, esc, title, eyebrow }) {
  const votes = revealed(round);
  if (outcome(round) === "agree") {
    return `
      <section class="screen center">
        <p class="eyebrow">${eyebrow} · ${title}</p>
        <h1 class="verdict-headline ${votes[0]}">${t(votes[0] === "guilty" ? "bothGuilty" : "bothNotGuilty")}</h1>
        <button class="btn primary" data-action="next-round">${t("nextCase")}</button>
      </section>`;
  }
  const canDebate = !round.revoted;
  return `
    <section class="screen">
      <p class="eyebrow">${eyebrow} · ${title}</p>
      <h1>${t("disagreement")}</h1>
      ${[0, 1].map((i) => `
        <div class="card ${votes[i]}">
          <p class="card-label">${esc(name(i))}</p>
          <p class="card-text">${t(VERDICT_KEYS[votes[i]])}</p>
        </div>`).join("")}
      <button class="btn primary" data-action="${canDebate ? "game" : "next-round"}" data-type="debate">
        ${canDebate ? t("courtInSession") : t("nextCase")}
      </button>
    </section>`;
}
