import test from "node:test";
import assert from "node:assert/strict";

import { parseFrontmatter } from "../lib/frontmatter.js";

test("parseFrontmatter splits yaml frontmatter from body", () => {
    const { frontmatter, body } = parseFrontmatter("---\ntitle: Hi\nweight: 3\n---\n\nBody text\n");
    assert.deepEqual(frontmatter, { title: "Hi", weight: 3 });
    assert.equal(body, "\nBody text\n");
});

test("parseFrontmatter returns empty frontmatter when there is none", () => {
    const { frontmatter, body } = parseFrontmatter("Just text");
    assert.deepEqual(frontmatter, {});
    assert.equal(body, "Just text");
});
