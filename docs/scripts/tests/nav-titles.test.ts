// (C) 2026 GoodData Corporation

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { parseFrontmatter } from "../lib/frontmatter.js";

/*
 * The sidebar shows `linkTitle` and the H1 shows `title`. When the two differ, a
 * reader who clicks "Installation" lands on "Add GoodData.UI to an existing React
 * app" and wonders if they hit the wrong page. One `title` serves both, so a guide
 * page must not set `linkTitle`.
 */

const here = dirname(fileURLToPath(import.meta.url));
const VERSION_ROOT = resolve(here, "..", "..", "content", "en", "latest");

/** Pages under api-reference/ are generated per build; only these two are ours. */
const OWNED_REFERENCE_PAGES = new Set(["api-reference/_index.md", "api-reference/versions.md"]);

function markdownFiles(dir: string): string[] {
    const found: string[] = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) found.push(...markdownFiles(full));
        else if (entry.name.endsWith(".md")) found.push(full);
    }
    return found;
}

test("pages use one title for the H1 and the nav", () => {
    const offenders = markdownFiles(VERSION_ROOT)
        .map((file) => relative(VERSION_ROOT, file).split(sep).join("/"))
        .filter((rel) => !rel.startsWith("api-reference/") || OWNED_REFERENCE_PAGES.has(rel))
        .filter((rel) => {
            const { frontmatter } = parseFrontmatter(readFileSync(join(VERSION_ROOT, rel), "utf8"));
            return frontmatter.linkTitle !== undefined;
        });
    assert.deepEqual(offenders, [], "drop `linkTitle` and make `title` short enough for the nav");
});
