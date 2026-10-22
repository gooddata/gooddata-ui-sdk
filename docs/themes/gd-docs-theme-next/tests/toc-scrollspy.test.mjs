// (C) 2026 GoodData Corporation

import assert from "node:assert/strict";
import test from "node:test";

import { activeOffset, computeActive } from "../assets/js/toc-scrollspy.js";

const mk = (link, top) => ({ link, heading: { getBoundingClientRect: () => ({ top }) } });

test("returns last heading above the offset", () => {
    assert.equal(computeActive([mk("a", -50), mk("b", 40), mk("c", 300)], 100), "b");
});
test("returns null when all headings are below offset", () => {
    assert.equal(computeActive([mk("a", 500)], 100), null);
});
test("activeOffset sits just under the headings' scroll-margin-top (chrome + 8px)", () => {
    assert.equal(activeOffset(149), 167);
});
test("activeOffset falls back to the CSS default (9.5rem) when the chrome was never measured", () => {
    assert.equal(activeOffset(NaN), 170);
    assert.equal(activeOffset(0), 170);
});
