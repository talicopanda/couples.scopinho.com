import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { LANGS } from "../couples/js/i18n.js";

const dir = new URL("../couples/content/", import.meta.url);
const files = (await readdir(dir)).filter((f) => f.endsWith(".json"));

function assertTranslated(field, where) {
  for (const lang of LANGS) {
    assert.ok(typeof field?.[lang] === "string" && field[lang].trim(), `${where} is missing "${lang}"`);
  }
}

for (const file of files) {
  test(`content/${file} is valid`, async () => {
    const data = JSON.parse(await readFile(new URL(file, dir), "utf8"));
    const categoryIds = new Set(data.categories.map((c) => c.id));
    data.categories.forEach((c) => assertTranslated(c.name, `category ${c.id} name`));

    const ids = new Set();
    for (const item of data.items) {
      assert.ok(!ids.has(item.id), `duplicate id ${item.id}`);
      ids.add(item.id);
      assert.ok(categoryIds.has(item.category), `${item.id} has unknown category ${item.category}`);
      if (data.game === "bet") assertTranslated(item.prompt, `${item.id} prompt`);
      if (data.game === "court") {
        for (const field of ["title", "scenario", "question"]) assertTranslated(item[field], `${item.id} ${field}`);
        (item.debate_prompts ?? []).forEach((p, i) => assertTranslated(p, `${item.id} debate_prompts[${i}]`));
      }
    }
    (data.defaultDebatePrompts ?? []).forEach((p, i) => assertTranslated(p, `defaultDebatePrompts[${i}]`));
    assert.ok(data.items.length > 0, "no items");
  });
}
