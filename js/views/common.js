export function handoff(title, subtitle, button, eyebrow) {
  return `
    <section class="screen center handoff">
      <p class="eyebrow">${eyebrow}</p>
      <h1>${title}</h1>
      <p>${subtitle}</p>
      <button class="btn primary" data-action="game" data-type="confirm">${button}</button>
    </section>`;
}

export function placeDown(t) {
  return `
    <section class="screen center">
      <h1>${t("placeDown")}</h1>
      <button class="btn primary" data-action="game" data-type="reveal">${t("reveal")}</button>
    </section>`;
}
