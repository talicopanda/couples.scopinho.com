import { predictor, revealed } from "../games/bet.js";
import { handoff, placeDown } from "./common.js";

export function render(round, { t, loc, name, esc }) {
  const subject = esc(name(round.subject));
  const guesser = esc(name(predictor(round)));
  const prompt = esc(loc(round.prompt.prompt));

  switch (round.phase) {
    case "intro":
      return `
        <section class="screen center">
          <p class="eyebrow">${t("roundN", { n: round.number })}</p>
          <h1 class="prompt big">${prompt}</h1>
          <p>${t("betIntro", { name: subject, other: guesser })}</p>
          <button class="btn primary" data-action="game" data-type="begin">${t("answerPrivately", { name: subject })}</button>
        </section>`;
    case "handoff-predictor":
      return handoff(t("passTo", { name: guesser }), t("betHandoffPredictor", { name: guesser, other: subject }), t("imName", { name: guesser }), t("roundN", { n: round.number }));
    case "answer-subject":
      return answer(t("answerYourself"), subject, prompt, t);
    case "answer-predictor":
      return answer(t("predictAnswer", { name: subject }), guesser, prompt, t);
    case "ready":
      return placeDown(t);
    case "reveal": {
      const answers = revealed(round);
      return `
        <section class="screen">
          <h2 class="prompt">${prompt}</h2>
          <div class="card">
            <p class="card-label">${t("said", { name: subject })}</p>
            <p class="card-text">${esc(answers.subject)}</p>
          </div>
          <div class="card alt">
            <p class="card-label">${t("predicted", { name: guesser })}</p>
            <p class="card-text">${esc(answers.predictor)}</p>
          </div>
          <button class="btn primary" data-action="next-round">${t("nextRound")}</button>
        </section>`;
    }
  }
  return "";
}

function answer(banner, player, prompt, t) {
  return `
    <section class="screen">
      <p class="banner">${banner}</p>
      <p class="player-tag">${player}</p>
      <h2 class="prompt">${prompt}</h2>
      <form data-form="answer">
        <textarea name="text" rows="3" maxlength="280" required
          placeholder="${t("answerPlaceholder")}" enterkeyhint="done"
          autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="false"></textarea>
        <button class="btn primary" type="submit">${t("lockIn")}</button>
      </form>
    </section>`;
}
