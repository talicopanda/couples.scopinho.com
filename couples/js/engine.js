export function shuffle(items, rng = Math.random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function createDeck(items, categoryIds, rng = Math.random) {
  const allowed = new Set(categoryIds);
  return shuffle(items.filter((item) => allowed.has(item.category)), rng);
}

export function otherPlayer(index) {
  return 1 - index;
}
