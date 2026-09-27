import test from "node:test";
import assert from "node:assert/strict";
import { createRound, advance, revealed, outcome, second, back, canGoBack } from "../js/games/court.js";

const item = { id: "court_001", category: "c", title: { en: "T" }, scenario: { en: "S" }, question: { en: "Q" } };
const content = { defaultDebatePrompts: [{ en: "Defend" }, { en: "Counter" }] };

function voteBoth(round, a, b) {
  if (round.phase === "intro") round = advance(round, { type: "begin" });
  if (round.phase === "handoff-first") round = advance(round, { type: "confirm" });
  round = advance(round, { type: "vote", verdict: a });
  round = advance(round, { type: "confirm" });
  round = advance(round, { type: "vote", verdict: b });
  return advance(round, { type: "reveal" });
}

test("first voter alternates each case", () => {
  assert.equal(createRound(item, 1, content).first, 0);
  assert.equal(createRound(item, 2, content).first, 1);
  assert.equal(second(createRound(item, 2, content)), 0);
});

test("votes stay hidden until reveal", () => {
  let round = advance(createRound(item, 1, content), { type: "begin" });
  round = advance(round, { type: "vote", verdict: "guilty" });
  assert.equal(revealed(round), null);
  round = advance(advance(round, { type: "confirm" }), { type: "vote", verdict: "guilty" });
  assert.equal(round.phase, "ready");
  assert.equal(revealed(round), null);
  assert.equal(outcome(round), null);
});

test("votes are stored per player, not per turn order", () => {
  const round = voteBoth(createRound(item, 2, content), "guilty", "not_guilty");
  assert.deepEqual(revealed(round), ["not_guilty", "guilty"]);
});

test("agreement resolves immediately; debate is refused", () => {
  const round = voteBoth(createRound(item, 1, content), "guilty", "guilty");
  assert.equal(outcome(round), "agree");
  assert.equal(advance(round, { type: "debate" }), round);
});

test("disagreement runs debate prompts one at a time, then final", () => {
  let round = voteBoth(createRound(item, 1, content), "guilty", "not_guilty");
  assert.equal(outcome(round), "disagree");
  round = advance(round, { type: "debate" });
  assert.equal(round.phase, "debate");
  assert.equal(round.debateIndex, 0);
  round = advance(round, { type: "next" });
  assert.equal(round.debateIndex, 1);
  round = advance(round, { type: "next" });
  assert.equal(round.phase, "final");
});

test("case-specific debate prompts override the defaults, and skip jumps to final", () => {
  let round = createRound({ ...item, debate_prompts: [{ en: "Only one" }] }, 1, content);
  assert.equal(round.debatePrompts.length, 1);
  round = advance(voteBoth(round, "guilty", "not_guilty"), { type: "debate" });
  assert.equal(advance(round, { type: "skip" }).phase, "final");
});

test("revote happens once, starts with a hand-off, and never re-enters debate", () => {
  let round = voteBoth(createRound(item, 1, content), "guilty", "not_guilty");
  round = advance(advance(round, { type: "debate" }), { type: "skip" });
  round = advance(round, { type: "revote" });
  assert.equal(round.phase, "handoff-first");
  assert.deepEqual(round.votes, [null, null]);
  round = voteBoth(round, "guilty", "not_guilty");
  assert.equal(advance(round, { type: "debate" }), round);
});

test("invalid verdicts are ignored", () => {
  const round = advance(createRound(item, 1, content), { type: "begin" });
  assert.equal(advance(round, { type: "vote", verdict: "maybe" }), round);
});

test("back before reveal undoes votes without exposing them", () => {
  let round = advance(createRound(item, 1, content), { type: "begin" });
  round = advance(round, { type: "vote", verdict: "guilty" });
  round = advance(advance(round, { type: "confirm" }), { type: "vote", verdict: "not_guilty" });
  round = back(round);
  assert.equal(round.phase, "vote-second");
  assert.deepEqual(round.votes, ["guilty", null]);
  round = back(back(round));
  assert.equal(round.phase, "vote-first");
  assert.deepEqual(round.votes, [null, null]);
  assert.equal(back(round).phase, "intro");
  assert.equal(back(back(round)), null);
});

test("back walks through debate, and undoing a revote restores the original votes", () => {
  let round = voteBoth(createRound(item, 1, content), "guilty", "not_guilty");
  assert.equal(canGoBack(round), false);
  round = advance(round, { type: "debate" });
  assert.equal(back(round).phase, "reveal");
  round = advance(advance(round, { type: "next" }), { type: "next" });
  assert.equal(round.phase, "final");
  assert.equal(back(round).debateIndex, 1);
  round = back(advance(round, { type: "revote" }));
  assert.equal(round.phase, "final");
  assert.equal(round.revoted, false);
  assert.deepEqual(round.votes, ["guilty", "not_guilty"]);
});
