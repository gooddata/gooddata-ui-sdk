// (C) 2026 GoodData Corporation

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

/*
 * head.html emits the social-card tags the GoodData Cloud docs emit (Open Graph
 * plus Twitter Card): title and description from the page, og:url from the same
 * computation as rel=canonical, and an image only when the site configures one
 * (params.seo.image). A page without `description` falls back to the site's.
 */

const here = dirname(fileURLToPath(import.meta.url));
const THEMES_DIR = resolve(here, "..", "..");
const HUGO = resolve(here, "..", "..", "..", "node_modules", ".bin", "hugo");
const BASE_URL = "https://example.com/docs/gooddata-ui/";
const IMAGE = "https://example.com/og/card.webp";

function write(path, body) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, body);
}

function page(title, extra = "") {
    return `---\ntitle: ${title}\n${extra}---\n\nbody\n`;
}

function buildFixture({ image }) {
    const site = mkdtempSync(join(tmpdir(), "head-meta-site-"));
    write(
        join(site, "hugo.toml"),
        `baseURL = "${BASE_URL}"
title = "Fixture docs"
themesDir = "${THEMES_DIR}"
theme = "gd-docs-theme-next"
disableKinds = ["taxonomy", "term", "rss", "sitemap"]
[params]
homeSlug = "latest"
description = "Site-wide description"
activeVersions = 1
${image ? `[params.seo]\nimage = "${IMAGE}"\n` : ""}
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
    c("latest/_index.md", page("Docs", "description: Landing description\n"));
    c("latest/described.md", page("Described", "description: Page description\n"));
    c("latest/bare.md", page("Bare"));
    c("11.57/_index.md", page("Docs 11.57"));
    c("11.57/described.md", page("Described 11.57"));

    const out = join(site, "public");
    execFileSync(HUGO, ["--source", site, "--destination", out, "--quiet"], { stdio: "pipe" });
    return out;
}

function meta(out, rel) {
    const html = readFileSync(join(out, rel, "index.html"), "utf8");
    const head = html.match(/<head>([\s\S]*?)<\/head>/)[1];
    const tags = {};
    for (const m of head.matchAll(/<meta (?:property|name)="([^"]+)" content="([^"]*)">/g)) {
        assert.equal(tags[m[1]], undefined, `${rel}: duplicate <meta ${m[1]}>`);
        tags[m[1]] = m[2];
    }
    tags.canonical = head.match(/<link rel="canonical" href="([^"]+)">/)[1];
    return tags;
}

const withImage = buildFixture({ image: true });
const withoutImage = buildFixture({ image: false });

test("a page's card carries its own title and description", () => {
    const t = meta(withImage, "latest/described");
    assert.equal(t["og:title"], "Described");
    assert.equal(t["twitter:title"], "Described");
    assert.equal(t["og:description"], "Page description");
    assert.equal(t["twitter:description"], "Page description");
    assert.equal(t.description, "Page description");
    assert.equal(t["og:type"], "article");
    assert.equal(t["og:site_name"], "Fixture docs");
});

test("a page without a description falls back to the site's", () => {
    const t = meta(withImage, "latest/bare");
    assert.equal(t.description, "Site-wide description");
    assert.equal(t["og:description"], "Site-wide description");
});

test("a section landing is a website, not an article", () => {
    assert.equal(meta(withImage, "latest")["og:type"], "website");
});

test("og:url is the canonical URL, so an archived page shares as the latest one", () => {
    const active = meta(withImage, "latest/described");
    assert.equal(active["og:url"], `${BASE_URL}latest/described/`);
    assert.equal(active["og:url"], active.canonical);
    const archived = meta(withImage, "11.57/described");
    assert.equal(archived.canonical, `${BASE_URL}latest/described/`);
    assert.equal(archived["og:url"], archived.canonical);
});

test("the configured image makes a large-image card; without it the card is text-only", () => {
    const t = meta(withImage, "latest/described");
    assert.equal(t["og:image"], IMAGE);
    assert.equal(t["twitter:image"], IMAGE);
    assert.equal(t["twitter:card"], "summary_large_image");
    const bare = meta(withoutImage, "latest/described");
    assert.equal(bare["og:image"], undefined);
    assert.equal(bare["twitter:image"], undefined);
    assert.equal(bare["twitter:card"], "summary");
});
