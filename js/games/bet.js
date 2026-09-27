import { otherPlayer } from "../engine.js";

export function createRound(prompt, roundNumber) {
  return {
    prompt,
    number: roundNumber,
    subject: (roundNumber - 1) % 2,
    phase: "intro",
    answers: { subject: null, predictor: null },
  };
}

export function predictor(round) {
  return otherPlayer(round.subject);
}

export function advance(round, action) {
  const text = typeof action.text === "string" ? action.text.trim() : "";
  switch (round.phase) {
    case "intro":
      if (action.type === "begin") return { ...round, phase: "answer-subject" };
      break;
    case "answer-subject":
      if (action.type === "submit" && text) {
        return { ...round, phase: "handoff-predictor", answers: { ...round.answers, subject: text } };
      }
      break;
    case "handoff-predictor":
      if (action.type === "confirm") return { ...round, phase: "answer-predictor" };
      break;
    case "answer-predictor":
      if (action.type === "submit" && text) {
        return { ...round, phase: "ready", answers: { ...round.answers, predictor: text } };
      }
      break;
    case "ready":
      if (action.type === "reveal") return { ...round, phase: "reveal" };
      break;
  }
  return round;
}

// The only way views may read answers; null until the reveal phase.
export function revealed(round) {
  return round.phase === "reveal" ? { ...round.answers } : null;
}

export function canGoBack(round) {
  return round.phase !== "reveal";
}

// Undoes the last step. Answers are cleared, never prefilled, so going back can't leak them.
// Returns null when the step to undo belongs to the previous round.
export function back(round) {
  switch (round.phase) {
    case "answer-subject":
      return { ...round, phase: "intro" };
    case "handoff-predictor":
      return { ...round, phase: "answer-subject", answers: { ...round.answers, subject: null } };
    case "answer-predictor":
      return { ...round, phase: "handoff-predictor" };
    case "ready":
      return { ...round, phase: "answer-predictor", answers: { ...round.answers, predictor: null } };
  }
  return null;
}
