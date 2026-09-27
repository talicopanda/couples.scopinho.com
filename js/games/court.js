import { otherPlayer } from "../engine.js";

export const VERDICTS = ["guilty", "not_guilty"];

const REVEALED_PHASES = new Set(["reveal", "debate", "final"]);

export function createRound(item, roundNumber, content) {
  return {
    case: item,
    number: roundNumber,
    first: (roundNumber - 1) % 2,
    phase: "intro",
    votes: [null, null],
    debatePrompts: item.debate_prompts?.length ? item.debate_prompts : content?.defaultDebatePrompts ?? [],
    debateIndex: 0,
    revoted: false,
  };
}

export function second(round) {
  return otherPlayer(round.first);
}

function withVote(round, player, verdict, phase) {
  const votes = [...round.votes];
  votes[player] = verdict;
  return { ...round, votes, phase };
}

export function advance(round, action) {
  const validVote = action.type === "vote" && VERDICTS.includes(action.verdict);
  switch (round.phase) {
    case "intro":
      if (action.type === "begin") return { ...round, phase: "vote-first" };
      break;
    case "handoff-first":
      if (action.type === "confirm") return { ...round, phase: "vote-first" };
      break;
    case "vote-first":
      if (validVote) return withVote(round, round.first, action.verdict, "handoff-second");
      break;
    case "handoff-second":
      if (action.type === "confirm") return { ...round, phase: "vote-second" };
      break;
    case "vote-second":
      if (validVote) return withVote(round, second(round), action.verdict, "ready");
      break;
    case "ready":
      if (action.type === "reveal") return { ...round, phase: "reveal" };
      break;
    case "reveal":
      if (action.type === "debate" && outcome(round) === "disagree" && !round.revoted) {
        return { ...round, phase: round.debatePrompts.length ? "debate" : "final", debateIndex: 0 };
      }
      break;
    case "debate":
      if (action.type === "skip") return { ...round, phase: "final" };
      if (action.type === "next") {
        const debateIndex = round.debateIndex + 1;
        return debateIndex < round.debatePrompts.length ? { ...round, debateIndex } : { ...round, phase: "final" };
      }
      break;
    case "final":
      if (action.type === "revote" && !round.revoted) {
        return { ...round, phase: "handoff-first", votes: [null, null], previousVotes: round.votes, revoted: true };
      }
      break;
  }
  return round;
}

// The only way views may read votes; null until the reveal.
export function revealed(round) {
  return REVEALED_PHASES.has(round.phase) ? [...round.votes] : null;
}

export function outcome(round) {
  const votes = revealed(round);
  if (!votes) return null;
  return votes[0] === votes[1] ? "agree" : "disagree";
}

export function canGoBack(round) {
  return round.phase !== "reveal";
}

// Undoes the last step. Votes are cleared, never shown, so going back can't leak them.
// Returns null when the step to undo belongs to the previous round.
export function back(round) {
  switch (round.phase) {
    case "vote-first":
      return { ...round, phase: round.revoted ? "handoff-first" : "intro" };
    case "handoff-first": {
      const { previousVotes, ...rest } = round;
      return { ...rest, phase: "final", votes: previousVotes, revoted: false };
    }
    case "handoff-second":
      return withVote(round, round.first, null, "vote-first");
    case "vote-second":
      return { ...round, phase: "handoff-second" };
    case "ready":
      return withVote(round, second(round), null, "vote-second");
    case "debate":
      return round.debateIndex > 0 ? { ...round, debateIndex: round.debateIndex - 1 } : { ...round, phase: "reveal" };
    case "final":
      return round.debatePrompts.length
        ? { ...round, phase: "debate", debateIndex: round.debatePrompts.length - 1 }
        : { ...round, phase: "reveal" };
  }
  return null;
}
