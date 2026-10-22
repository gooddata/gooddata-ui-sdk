// (C) 2026 GoodData Corporation

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

// gd-header.css is a PORT of the first-row rules from marketing's Header.css. That file also
// styles body, h1, h2, b, strong and Docsy's .td-*; pasting it in whole would restyle every page.
// Every selector here must therefore stay under a .gd- class.
const css = readFileSync(fileURLToPath(new URL("../assets/css/gd-header.css", import.meta.url)), "utf8");
// The header comment mentions "position: fixed" (Cloud's value), so assertions read the code only.
const code = css.replace(/\/\*[\s\S]*?\*\//g, "");

const selectors = code
    .match(/[^{}]+(?=\{)/g)
    .map((s) => s.trim())
    .filter((s) => !s.startsWith("@"))
    .flatMap((s) => s.split(","))
    .map((s) => s.trim().replace(/^\.dark\s+/, ""));

test("stylesheet has rules", () => {
    assert.ok(selectors.length > 20, `only ${selectors.length} selectors found`);
});

test("every selector is scoped to a .gd- class", () => {
    const stray = selectors.filter((s) => !s.startsWith(".gd-"));
    assert.deepEqual(stray, []);
});

// The logo is a file painted through a CSS mask with the text token (topbar.html). A mask keeps
// only the shapes, so a second colour in a redrawn logo would silently turn into the text colour.
test("the logo is one colour, and the mask paints it with the text token", () => {
    const svg = readFileSync(
        fileURLToPath(new URL("../assets/icons/GoodDataLearn.svg", import.meta.url)),
        "utf8",
    );
    const colours = new Set(
        [...svg.matchAll(/\b(?:fill|stroke)="([^"]+)"/g)].map((m) => m[1].toLowerCase()).filter((c) => c !== "none"),
    );
    assert.deepEqual([...colours], ["#09090c"]);
    assert.match(code, /\.gd-header-nav__logo-glyph\s*\{[^}]*background-color:\s*var\(--color-gd-text\)[^}]*mask:\s*var\(--gd-logo\)/);
});

test("the row is not position: fixed (it lives in the sticky #site-chrome)", () => {
    assert.doesNotMatch(code, /position:\s*fixed/);
});
