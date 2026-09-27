import test from "node:test";
import assert from "node:assert/strict";
import { strings, t, loc, setLang, detectLang } from "../couples/js/i18n.js";

test("every language has the same UI string keys", () => {
  const en = Object.keys(strings.en).sort();
  for (const [lang, table] of Object.entries(strings)) {
    assert.deepEqual(Object.keys(table).sort(), en, `${lang} keys differ from en`);
  }
});

test("t interpolates and loc falls back to English", () => {
  setLang("pt");
  assert.equal(t("passTo", { name: "Ana" }), "Passe para Ana");
  assert.equal(loc({ en: "Hi" }), "Hi");
  setLang("en");
});

test("detectLang maps any Portuguese locale to pt", () => {
  assert.equal(detectLang({ language: "pt-BR" }), "pt");
  assert.equal(detectLang({ language: "en-US" }), "en");
});
