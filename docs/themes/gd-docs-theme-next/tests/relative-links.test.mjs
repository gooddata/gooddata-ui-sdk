// (C) 2026 GoodData Corporation

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

/*
 * A page-relative link or image in the content (`../drillable-items/`, `insightview/`, a home
 * shortcode's `./getting-started/`) is resolved at build time against the page it is on
 * (_partials/resolve-url.html), because www.gooddata.ai serves a page without its trailing slash
 * too, and a link left relative then resolves one level too high. The build mirrors production:
 * a baseURL with a path, canonifyURLs on.
 *
 * Each assertion resolves the emitted href against the page's URL *without* the slash, the broken
 * case, and expects the right target; a relative href would fail that.
 */

const here = dirname(fileURLToPath(import.meta.url));
const THEMES_DIR = resolve(here, "..", "..");
const HUGO = resolve(here, "..", "..", "..", "node_modules", ".bin", "hugo");
const BASE_URL = "https://example.com/docs/gooddata-ui/";

function write(path, body) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, body);
}

function page(title, body = "") {
    return `---\ntitle: ${title}\n---\n\n${body}`;
}

function buildFixture() {
    const site = mkdtempSync(join(tmpdir(), "relative-links-site-"));
    write(
        join(site, "hugo.toml"),
        `baseURL = "${BASE_URL}"
title = "Fixture docs"
themesDir = "${THEMES_DIR}"
theme = "gd-docs-theme-next"
canonifyURLs = true
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
    for (const partial of ["css.html", "scripts.html", "footer.html"]) {
        write(join(site, "layouts", "_partials", partial), "");
    }
    const c = (rel, body) => write(join(site, "content", rel), body);
    c(
        "latest/_index.md",
        page(
            "Docs",
            `{{< home/actions primary="Quick start" primaryHref="./getting-started/quickstart/" secondary="Components" secondaryHref="./visualisations/" >}}

{{< home/links >}}
{{< home/link title="Integrate" href="./integrations/" >}}Connect your application.{{< /home/link >}}
{{< /home/links >}}

{{< home/clients >}}
{{< home/client title="React" href="./getting-started/quickstart/" >}}React components.{{< /home/client >}}
{{< home/client title="Blog" href="https://example.org/blog/" >}}Elsewhere.{{< /home/client >}}
{{< /home/clients >}}
`,
        ),
    );
    c("latest/getting-started/quickstart.md", page("Quick start"));
    c("latest/integrations/_index.md", page("Integrations"));
    c("latest/visualisations/_index.md", page("Visualizations", "[InsightView](insightview/)\n"));
    c("latest/visualisations/insightview.md", page("InsightView"));
    c("latest/integrations/interactivity/drillable-items.md", page("Drillable items"));
    c(
        "latest/integrations/interactivity/on-drill.md",
        page(
            "OnDrill",
            `[sibling](../drillable-items/)
[sibling-anchor](../drillable-items/#usage)
[sibling-query](../drillable-items/?v=1)
[parent](../)
[dotdot](..)
[self](./)
[self-section](./#props)
[bare](drillable-items/)
[anchor](#props)
[relref]({{< relref "/latest/integrations/interactivity/drillable-items.md" >}})
[root](/latest/integrations/interactivity/drillable-items/)
[external](https://example.org/x/)
[mail](mailto:docs@example.org)

![shot](../shot.png)
`,
        ),
    );

    const out = join(site, "public");
    execFileSync(HUGO, ["--source", site, "--destination", out, "--quiet"], { stdio: "pipe" });
    return out;
}

const out = buildFixture();

/** The page's <main>, so a sidebar or breadcrumb link to the same page can't stand in for one in the content. */
function html(rel) {
    const page = readFileSync(join(out, rel, "index.html"), "utf8");
    return page.slice(page.indexOf("<main"), page.indexOf("</main>"));
}

/** The href of the link whose text (tags stripped) is `label`, or starts with it as a word. */
function href(markup, label) {
    for (const m of markup.matchAll(/<a href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)) {
        const text = m[2]
            .replace(/<[^>]*>/g, "")
            .replace(/\s+/g, " ")
            .trim();
        if (text === label || text.startsWith(`${label} `)) {
            return m[1];
        }
    }
    return assert.fail(`no link labelled ${label}`);
}

/** Where `url` leads when the page was opened without its trailing slash. */
function fromSlashless(url, pageDir) {
    return new URL(url, `${BASE_URL}${pageDir}`).href;
}

const INTERACTIVITY = `${BASE_URL}latest/integrations/interactivity/`;

test("a guide's relative links resolve against the page, with fragment, query, and slash kept", () => {
    const m = html("latest/integrations/interactivity/on-drill");
    const at = (label) => fromSlashless(href(m, label), "latest/integrations/interactivity/on-drill");
    assert.equal(at("sibling"), `${INTERACTIVITY}drillable-items/`);
    assert.equal(at("sibling-anchor"), `${INTERACTIVITY}drillable-items/#usage`);
    assert.equal(at("sibling-query"), `${INTERACTIVITY}drillable-items/?v=1`);
    assert.equal(at("parent"), INTERACTIVITY);
    assert.equal(at("dotdot"), INTERACTIVITY);
    assert.equal(at("self"), `${INTERACTIVITY}on-drill/`);
    assert.equal(at("self-section"), `${INTERACTIVITY}on-drill/#props`);
});

test("a bare relative link resolves against the page's own directory, as the browser does from the slashed URL", () => {
    const m = html("latest/integrations/interactivity/on-drill");
    assert.equal(
        fromSlashless(href(m, "bare"), "latest/integrations/interactivity/on-drill"),
        `${INTERACTIVITY}on-drill/drillable-items/`,
    );
});

test("a relative link comes out the same as relref and a root-relative link to that page", () => {
    const m = html("latest/integrations/interactivity/on-drill");
    assert.equal(href(m, "sibling"), href(m, "relref"));
    assert.equal(href(m, "sibling"), href(m, "root"));
});

test("an in-page anchor, a scheme, and mailto are left as written", () => {
    const m = html("latest/integrations/interactivity/on-drill");
    assert.equal(href(m, "anchor"), "#props");
    assert.equal(href(m, "external"), "https://example.org/x/");
    assert.equal(href(m, "mail"), "mailto:docs@example.org");
});

test("a relative image resolves against the page", () => {
    const m = html("latest/integrations/interactivity/on-drill");
    const src = m.match(/<img src="([^"]*)" alt="shot"/)[1];
    assert.equal(
        fromSlashless(src, "latest/integrations/interactivity/on-drill"),
        `${INTERACTIVITY}shot.png`,
    );
});

test("the docs home's buttons and links work when it was opened as …/latest", () => {
    const m = html("latest");
    const at = (label) => fromSlashless(href(m, label), "latest");
    assert.equal(at("Quick start"), `${BASE_URL}latest/getting-started/quickstart/`);
    assert.equal(at("Components"), `${BASE_URL}latest/visualisations/`);
    assert.equal(at("Integrate"), `${BASE_URL}latest/integrations/`);
    assert.equal(at("React"), `${BASE_URL}latest/getting-started/quickstart/`);
    assert.equal(href(m, "Blog"), "https://example.org/blog/");
});

test("a section index's bare relative links resolve against the section", () => {
    const m = html("latest/visualisations");
    assert.equal(
        fromSlashless(href(m, "InsightView"), "latest/visualisations"),
        `${BASE_URL}latest/visualisations/insightview/`,
    );
});
