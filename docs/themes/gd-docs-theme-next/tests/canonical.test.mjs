// (C) 2026 GoodData Corporation

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

/*
 * The canonical tag follows the pre-reorg theme's meta-version.html: a page in
 * an archived version (any [[params.versions]] entry past the first
 * params.activeVersions) points at its counterpart in the newest active
 * version, everything else at itself. Archived copies keep the flat pre-reorg
 * tree, so the counterpart is found through the same `aliases` map that
 * index.redir turns into 301s — the tag names a page that answers 200.
 */

const here = dirname(fileURLToPath(import.meta.url));
const THEMES_DIR = resolve(here, "..", "..");
const HUGO = resolve(here, "..", "..", "..", "node_modules", ".bin", "hugo");
const BASE_URL = "https://example.com/docs/gooddata-ui/";

function write(path, body) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, body);
}

function page(title, extra = "") {
    return `---\ntitle: ${title}\n${extra}---\n\nbody\n`;
}

function buildFixture() {
    const site = mkdtempSync(join(tmpdir(), "canonical-site-"));
    write(
        join(site, "hugo.toml"),
        `baseURL = "${BASE_URL}"
themesDir = "${THEMES_DIR}"
theme = "gd-docs-theme-next"
disableKinds = ["taxonomy", "term", "rss", "sitemap"]
[params]
homeSlug = "latest"
activeVersions = 1
[[params.versions]]
version = "11.58"
dirpath = "latest"
url = "/latest/"
[[params.versions]]
version = "11.57"
dirpath = "11.57"
url = "/11.57/"
`,
    );
    // The chrome that needs Tailwind, esbuild or the network is not under test.
    for (const partial of ["css.html", "scripts.html", "footer.html"]) {
        write(join(site, "layouts", "_partials", partial), "");
    }
    const c = (rel, body) => write(join(site, "content", rel), body);
    // Newest active version: the reorganized tree.
    c("latest/_index.md", page("Docs"));
    c("latest/kept.md", page("Kept"));
    c("latest/guides/_index.md", page("Guides"));
    c("latest/guides/new-page.md", page("New page", 'aliases:\n  - "../old-section/old-page/"\n'));
    // Archived version: the flat pre-reorg tree.
    c("11.57/_index.md", page("Docs 11.57"));
    c("11.57/kept.md", page("Kept 11.57"));
    c("11.57/old-section/_index.md", page("Old section"));
    c("11.57/old-section/old-page.md", page("Old page"));
    c("11.57/dropped.md", page("Dropped"));

    const out = join(site, "public");
    execFileSync(HUGO, ["--source", site, "--destination", out, "--quiet"], { stdio: "pipe" });
    return out;
}

const out = buildFixture();

function canonical(rel) {
    const html = readFileSync(join(out, rel, "index.html"), "utf8");
    const tags = [...html.matchAll(/<link rel="canonical" href="([^"]+)">/g)].map((m) => m[1]);
    assert.equal(tags.length, 1, `${rel}: expected exactly one canonical tag, found ${tags.length}`);
    return tags[0];
}

test("a page in the active version is its own canonical", () => {
    assert.equal(canonical("latest/kept"), `${BASE_URL}latest/kept/`);
    assert.equal(canonical("latest/guides/new-page"), `${BASE_URL}latest/guides/new-page/`);
});

test("an archived page with the same path in the active version points there", () => {
    assert.equal(canonical("11.57/kept"), `${BASE_URL}latest/kept/`);
    assert.equal(canonical("11.57"), `${BASE_URL}latest/`);
});

test("an archived page whose old path is redirected follows the alias to the reorganized page", () => {
    assert.equal(canonical("11.57/old-section/old-page"), `${BASE_URL}latest/guides/new-page/`);
});

test("an archived page with no counterpart keeps its own URL rather than naming a 404", () => {
    assert.equal(canonical("11.57/dropped"), `${BASE_URL}11.57/dropped/`);
    assert.equal(canonical("11.57/old-section"), `${BASE_URL}11.57/old-section/`);
});
