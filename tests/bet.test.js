import test from "node:test";
import assert from "node:assert/strict";
import { createRound, advance, revealed, predictor, back, canGoBack } from "../js/games/bet.js";

const prompt = { id: "p", category: "c", prompt: { en: "Q?" } };

function playThrough(round) {
  round = advance(round, { type: "begin" });
  round = advance(round, { type: "submit", text: " camera " });
  round = advance(round, { type: "confirm" });
  round = advance(round, { type: "submit", text: "computer" });
  return round;
}

test("subject and predictor alternate each round", () => {
  assert.equal(createRound(prompt, 1).subject, 0);
  assert.equal(createRound(prompt, 2).subject, 1);
  assert.equal(createRound(prompt, 3).subject, 0);
  assert.equal(predictor(createRound(prompt, 1)), 1);
});

test("phases run shared intro → answer → hand-off → answer → ready → reveal", () => {
  const phases = [];
  let round = createRound(prompt, 1);
  const actions = [
    { type: "begin" },
    { type: "submit", text: "a" },
    { type: "confirm" },
    { type: "submit", text: "b" },
    { type: "reveal" },
  ];
  phases.push(round.phase);
  for (const action of actions) {
    round = advance(round, action);
    phases.push(round.phase);
  }
  assert.deepEqual(phases, ["intro", "answer-subject", "handoff-predictor", "answer-predictor", "ready", "reveal"]);
});

test("answers stay hidden until reveal", () => {
  let round = createRound(prompt, 1);
  assert.equal(revealed(round), null);
  round = playThrough(round);
  assert.equal(round.phase, "ready");
  assert.equal(revealed(round), null);
  round = advance(round, { type: "reveal" });
  assert.deepEqual(revealed(round), { subject: "camera", predictor: "computer" });
});

test("blank submissions and out-of-phase actions are ignored", () => {
  let round = advance(createRound(prompt, 1), { type: "begin" });
  assert.equal(advance(round, { type: "submit", text: "   " }), round);
  assert.equal(advance(round, { type: "reveal" }), round);
});

test("back undoes each step and clears the undone answer", () => {
  let round = playThrough(createRound(prompt, 1));
  round = back(round);
  assert.equal(round.phase, "answer-predictor");
  assert.equal(round.answers.predictor, null);
  round = back(back(round));
  assert.equal(round.phase, "answer-subject");
  assert.equal(round.answers.subject, null);
  assert.equal(back(round).phase, "intro");
  assert.equal(back(back(round)), null);
});

test("no going back once answers are revealed", () => {
  const round = advance(playThrough(createRound(prompt, 1)), { type: "reveal" });
  assert.equal(canGoBack(round), false);
});
