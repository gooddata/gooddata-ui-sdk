// (C) 2026 GoodData Corporation

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { JSDOM } from "jsdom";

/*
 * sidebar-tree.html renders a section with several pages as a foldable group:
 * a header link (to the section's overview) beside a chevron button that
 * controls the panel with the section's pages. sidebar-collapse.js wires the
 * folding from the data-nav-* hooks and the aria-controls id. A section with a
 * single page is flattened to one link and a nav_leaf section (an API reference
 * package) is one link: neither gets a chevron.
 */

const here = dirname(fileURLToPath(import.meta.url));
const THEMES_DIR = resolve(here, "..", "..");
const HUGO = resolve(here, "..", "..", "..", "node_modules", ".bin", "hugo");

function write(path, body) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, body);
}

function page(title, extra = "") {
    return `---\ntitle: ${title}\n${extra}---\n\nbody\n`;
}

function buildFixture() {
    const site = mkdtempSync(join(tmpdir(), "sidebar-tree-site-"));
    write(
        join(site, "hugo.toml"),
        `baseURL = "https://example.com/docs/gooddata-ui/"
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
`,
    );
    // The chrome that needs Tailwind, esbuild or the network is not under test.
    for (const partial of ["css.html", "scripts.html", "footer.html"]) {
        write(join(site, "layouts", "_partials", partial), "");
    }
    const c = (rel, body) => write(join(site, "content", rel), body);
    c("latest/_index.md", page("Docs"));
    c("latest/intro.md", page("Intro"));
    c("latest/guides/_index.md", page("Guides"));
    c("latest/guides/alpha.md", page("Alpha"));
    c("latest/guides/beta.md", page("Beta"));
    c("latest/guides/nested/_index.md", page("Nested"));
    c("latest/guides/nested/one.md", page("One"));
    c("latest/guides/nested/two.md", page("Two"));
    c("latest/lonely/_index.md", page("Lonely"));
    c("latest/lonely/only.md", page("Only"));
    c("latest/api/_index.md", page("API", "nav_leaf: true\n"));
    c("latest/api/symbol.md", page("Symbol"));

    const out = join(site, "public");
    execFileSync(HUGO, ["--source", site, "--destination", out, "--quiet"], { stdio: "pipe" });
    return out;
}

const out = buildFixture();

function sidebar(rel) {
    const html = readFileSync(join(out, rel, "index.html"), "utf8");
    return new JSDOM(html).window.document.getElementById("sidebar");
}

const section = (nav, key) => nav.querySelector(`[data-nav-section="${key}"]`);

test("a section with several pages is a foldable group: header link, chevron, panel", () => {
    const nav = sidebar("latest/intro");
    const guides = section(nav, "/docs/gooddata-ui/latest/guides/");
    assert.ok(guides, "the group is keyed by the section's path");

    const header = guides.querySelector(":scope > div > a[data-nav-link]");
    assert.ok(header.classList.contains("gd-nav-group"), "the header keeps the group styling");
    assert.equal(header.getAttribute("href"), "/docs/gooddata-ui/latest/guides/");
    assert.equal(header.textContent.trim(), "Guides");

    const toggle = guides.querySelector(":scope > div > button[data-nav-toggle]");
    assert.ok(toggle, "the chevron sits in the header row beside the link");
    assert.equal(toggle.getAttribute("type"), "button");
    assert.equal(toggle.getAttribute("aria-expanded"), "true", "open before any script runs");
    assert.ok(toggle.getAttribute("aria-label").includes("Guides"), "the chevron names its section");

    const panel = guides.querySelector(":scope > [data-nav-panel]");
    assert.ok(panel, "the panel is the section's own child");
    assert.equal(toggle.getAttribute("aria-controls"), panel.id, "the chevron controls the panel");
    assert.deepEqual(
        [...panel.querySelectorAll(":scope > a")].map((a) => a.textContent.trim()),
        ["Alpha", "Beta"],
        "the section's pages are inside the panel",
    );
});

test("a nested section is its own group inside the parent's panel", () => {
    const nav = sidebar("latest/intro");
    const guides = section(nav, "/docs/gooddata-ui/latest/guides/");
    const nested = guides.querySelector(":scope > [data-nav-panel] > [data-nav-section]");
    assert.equal(nested?.getAttribute("data-nav-section"), "/docs/gooddata-ui/latest/guides/nested/");
    const toggle = nested.querySelector(":scope > div > button[data-nav-toggle]");
    const panel = nested.querySelector(":scope > [data-nav-panel]");
    assert.equal(toggle.getAttribute("aria-controls"), panel.id);
    assert.notEqual(panel.id, guides.querySelector(":scope > [data-nav-panel]").id, "panel ids are unique");
});

test("a single-page section and a nav_leaf section stay plain links without a chevron", () => {
    const nav = sidebar("latest/intro");
    assert.equal(section(nav, "/docs/gooddata-ui/latest/lonely/"), null);
    assert.equal(section(nav, "/docs/gooddata-ui/latest/api/"), null);
    const texts = [...nav.querySelectorAll("a.gd-nav-link:not(.gd-nav-group)")].map((a) =>
        a.textContent.trim(),
    );
    assert.ok(texts.includes("Lonely") && texts.includes("API"));
    assert.equal(nav.querySelectorAll("button[data-nav-toggle]").length, 2, "only Guides and Nested fold");
});

test("the header link is the current page on the overview, and the current location inside the section", () => {
    const header = (rel, key) => section(sidebar(rel), key).querySelector(":scope > div > [data-nav-link]");
    const guides = "/docs/gooddata-ui/latest/guides/";
    assert.equal(header("latest/guides", guides).getAttribute("aria-current"), "page");
    assert.equal(header("latest/guides/alpha", guides).getAttribute("aria-current"), "location");
    const onChild = section(sidebar("latest/guides/alpha"), guides);
    const child = onChild.querySelector(':scope > [data-nav-panel] > a[aria-current="page"]');
    assert.equal(child?.textContent.trim(), "Alpha", "the child inside the panel keeps the pill");
    assert.equal(
        header("latest/intro", guides).getAttribute("aria-current"),
        null,
        "unrelated page: no mark",
    );
});

test("a page deep in a nested section marks every ancestor header, not just the nearest", () => {
    const nav = sidebar("latest/guides/nested/one");
    const mark = (key) =>
        section(nav, key).querySelector(":scope > div > [data-nav-link]").getAttribute("aria-current");
    assert.equal(mark("/docs/gooddata-ui/latest/guides/"), "location");
    assert.equal(mark("/docs/gooddata-ui/latest/guides/nested/"), "location");
});

test("fold state is not stored: no inline script reads it back", () => {
    const html = readFileSync(join(out, "latest/intro/index.html"), "utf8");
    assert.ok(!html.includes("gd-nav-collapsed"), "no stored fold key in the page");
    const nav = sidebar("latest/intro");
    assert.equal(nav.querySelectorAll("script").length, 0, "the sidebar carries no inline script");
});
