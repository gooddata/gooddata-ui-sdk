// (C) 2026 GoodData Corporation

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, posix, relative, resolve, sep } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { parseFrontmatter } from "../lib/frontmatter.js";

/*
 * The reorganized docs replace the pre-reorg `/latest/` tree. Every old page URL
 * has to keep working, so each new page lists its old locations in `aliases`.
 * Those aliases are page-relative on purpose: the same page is built under
 * /latest/ and under /11.xx/ in every archived copy, and a relative alias resolves inside whichever folder it lands
 * in. An absolute alias would be written identically by every versioned copy and
 * the last build would win.
 *
 * `layouts/index.redir` turns the same aliases into forced Netlify 301s, and a
 * forced rule outranks a real file — so an alias that collides with a live page
 * would make that page unreachable. These tests are what makes forcing safe.
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

/** Hugo lowercases output paths; `_index.md` renders as its own directory. */
function pageUrl(relPath: string): string {
    const lower = relPath.toLowerCase().replace(/\.md$/, "");
    const stripped = lower === "_index" ? "" : lower.replace(/(^|\/)_index$/, "");
    return stripped === "" ? "" : `${stripped}/`;
}

/**
 * Where Hugo resolves a page-relative alias from: the directory the page is
 * written into, which for a section index is the section's parent. Proven by the
 * pre-reorg compatibility page, whose `../../architecture/…` alias is served at
 * /latest/architecture/architecture_overview/supported_versions/.
 */
function aliasBase(relPath: string): string {
    const url = pageUrl(relPath);
    if (url === "") return "..";
    return posix.dirname(url.replace(/\/$/, ""));
}

function resolveAlias(relPath: string, alias: string): string {
    const base = aliasBase(relPath);
    const joined = posix.normalize(posix.join(base === "." ? "" : base, alias));
    return joined.endsWith("/") ? joined : `${joined}/`;
}

interface DocPage {
    relPath: string;
    url: string;
    aliases: string[];
    legacyPath?: string;
}

const pages: DocPage[] = markdownFiles(VERSION_ROOT)
    .map((full) => relative(VERSION_ROOT, full).split(sep).join("/"))
    .filter((rel) => !rel.startsWith("api-reference/") || OWNED_REFERENCE_PAGES.has(rel))
    .sort()
    .map((relPath) => {
        const { frontmatter } = parseFrontmatter(readFileSync(join(VERSION_ROOT, relPath), "utf8"));
        const raw = frontmatter.aliases;
        return {
            relPath,
            url: pageUrl(relPath),
            aliases: Array.isArray(raw) ? (raw as string[]) : [],
            legacyPath: typeof frontmatter.legacy_path === "string" ? frontmatter.legacy_path : undefined,
        };
    });

test("the docs tree was found and carries aliases", () => {
    assert.ok(pages.length > 50, `expected the reorganized tree, found ${pages.length} pages`);
    assert.ok(
        pages.some((page) => page.aliases.length > 0),
        "no page declares aliases",
    );
});

test("every alias is page-relative, lowercase and slash-terminated", () => {
    for (const page of pages) {
        for (const alias of page.aliases) {
            assert.equal(typeof alias, "string", `${page.relPath}: alias must be a string`);
            assert.ok(
                !alias.startsWith("/"),
                `${page.relPath}: alias "${alias}" is site-absolute; use a page-relative path so it resolves inside every version folder`,
            );
            assert.equal(
                alias,
                alias.toLowerCase(),
                `${page.relPath}: alias "${alias}" must be lowercase — Hugo lowercases page URLs`,
            );
            assert.ok(alias.endsWith("/"), `${page.relPath}: alias "${alias}" must end with "/"`);
            assert.ok(!alias.includes(" "), `${page.relPath}: alias "${alias}" must not contain spaces`);
        }
    }
});

test("every alias resolves inside the version folder", () => {
    for (const page of pages) {
        for (const alias of page.aliases) {
            const resolved = resolveAlias(page.relPath, alias);
            assert.ok(
                !resolved.startsWith("..") && !resolved.startsWith("/"),
                `${page.relPath}: alias "${alias}" escapes the version folder (resolves to "${resolved}")`,
            );
        }
    }
});

test("a page that names a legacy_path also redirects from it", () => {
    for (const page of pages) {
        if (!page.legacyPath) continue;
        const expected = `${page.legacyPath.replace(/^\/|\/$/g, "").toLowerCase()}/`;
        const resolved = page.aliases.map((alias) => resolveAlias(page.relPath, alias));
        assert.ok(
            resolved.includes(expected),
            `${page.relPath}: legacy_path "${page.legacyPath}" has no alias redirecting from it (aliases resolve to ${JSON.stringify(resolved)})`,
        );
    }
});

test("no two pages claim the same alias", () => {
    const owner = new Map<string, string>();
    for (const page of pages) {
        for (const alias of page.aliases) {
            const resolved = resolveAlias(page.relPath, alias);
            const existing = owner.get(resolved);
            assert.equal(
                existing,
                undefined,
                `"${resolved}" is claimed by both ${existing} and ${page.relPath}; Hugo would write one alias file over the other`,
            );
            owner.set(resolved, page.relPath);
        }
    }
});

test("no alias shadows a real page", () => {
    const urls = new Set(pages.map((page) => page.url));
    for (const page of pages) {
        for (const alias of page.aliases) {
            const resolved = resolveAlias(page.relPath, alias);
            assert.ok(
                !urls.has(resolved),
                `${page.relPath}: alias "${alias}" resolves to "${resolved}", which is a real page — the forced 301 in index.redir would make that page unreachable`,
            );
        }
    }
});
