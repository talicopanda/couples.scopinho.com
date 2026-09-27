import test from "node:test";
import assert from "node:assert/strict";
import { shuffle, createDeck } from "../js/engine.js";

test("shuffle keeps every item and does not mutate the input", () => {
  const items = [1, 2, 3, 4, 5];
  const result = shuffle(items);
  assert.deepEqual(items, [1, 2, 3, 4, 5]);
  assert.deepEqual([...result].sort(), items);
});

test("createDeck only includes selected categories, without repeats", () => {
  const items = [
    { id: "a", category: "x" },
    { id: "b", category: "y" },
    { id: "c", category: "x" },
  ];
  const deck = createDeck(items, ["x"]);
  assert.deepEqual(deck.map((i) => i.id).sort(), ["a", "c"]);
});
