// (C) 2026 GoodData Corporation

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
// The committed footer snapshot is what the build falls back to when the live
// feed is unreachable, so it is load-bearing, not decoration. These assertions
// pin the shape footer.html reads; a refreshed snapshot that drops a key or
// changes a type fails here instead of silently rendering an empty footer.
import test from "node:test";
import { fileURLToPath } from "node:url";

const data = JSON.parse(readFileSync(fileURLToPath(new URL("../data/footer.json", import.meta.url)), "utf8"));
const footer = data.footer;

// footer.html drops banner items whose `action` is "subscribe": they open the
// marketing site's newsletter modal, which these docs do not carry.
const isRendered = (item) => item.action !== "subscribe";

test("snapshot exposes the four arrays footer.html iterates", () => {
    assert.ok(footer, "missing top-level `footer` key");
    for (const key of ["bannerLinks", "links", "copyright", "buttons"]) {
        assert.ok(Array.isArray(footer[key]), `footer.${key} must be an array`);
        assert.ok(footer[key].length > 0, `footer.${key} must not be empty`);
    }
});

test("every link group has a title and non-empty items", () => {
    for (const group of [...footer.bannerLinks, ...footer.links]) {
        assert.equal(typeof group.title, "string");
        assert.ok(group.title.length > 0);
        assert.ok(Array.isArray(group.items) && group.items.length > 0, `group ${group.title} has no items`);
    }
});

test("group titles carry no markup beyond the <br> the banner uses", () => {
    // The banner title is rendered with safeHTML because marketing puts a
    // responsive <br> in it. That is the only tag the feed is trusted to
    // carry; anything else in a refreshed snapshot is a red flag, not a
    // feature.
    for (const group of [...footer.bannerLinks, ...footer.links]) {
        const tags = group.title.match(/<[^>]+>/g) ?? [];
        for (const tag of tags) {
            assert.match(tag, /^<br\b[^>]*>$/, `${group.title}: unexpected markup ${tag}`);
        }
    }
});

test("the banner carries the caption the AI provider buttons sit under", () => {
    // footer.html renders `subtitle` as the "Ask AI for a quick overview" line
    // above footer-ai-buttons.html. It is optional in the template, so a feed
    // that drops it would render the buttons with no explanation and no error.
    for (const group of footer.bannerLinks) {
        assert.equal(typeof group.subtitle, "string", `${group.title}: banner group without a subtitle`);
        assert.ok(group.subtitle.length > 0);
    }
});

test("every rendered link carries both a title and a link", () => {
    // footer-link.html renders nothing without `link`, so a link-less item is a
    // silently missing row rather than a visible error.
    for (const group of [...footer.bannerLinks, ...footer.links]) {
        for (const item of group.items.filter(isRendered)) {
            assert.equal(typeof item.title, "string", `${group.title}: item without a title`);
            assert.equal(typeof item.link, "string", `${group.title}/${item.title}: item without a link`);
            assert.ok(item.link.length > 0);
        }
    }
});

test("the subscribe action is the only item footer.html skips", () => {
    // Documents the contract rather than the accident: the feed ships
    // "Subscribe for updates" with `action: "subscribe"` and a "#" link. It is
    // expected, filtered, and must stay the only actioned item — a new action
    // type would need a branch in footer.html, not silent rendering as a link.
    const actioned = [...footer.bannerLinks, ...footer.links].flatMap((g) => g.items.filter((i) => i.action));
    for (const item of actioned) {
        assert.equal(item.action, "subscribe", `${item.title}: unknown action ${item.action}`);
    }
});

test("hrefs are either absolute or root-relative", () => {
    // footer-link.html prefixes anything not starting with http:// or https://
    // with the marketing host; a bare relative path would silently resolve
    // against the docs site instead.
    const all = [...footer.bannerLinks, ...footer.links].flatMap((g) =>
        g.items.filter(isRendered).map((i) => i.link),
    );
    const buttons = footer.buttons.filter((b) => b.link).map((b) => b.link);
    for (const href of [...all, ...buttons, ...footer.copyright.filter((c) => c.link).map((c) => c.link)]) {
        assert.ok(/^(https?:\/\/|\/)/.test(href), `${href} is neither absolute nor root-relative`);
    }
});

test("copyright carries a plain-text line and at least one legal link", () => {
    assert.ok(
        footer.copyright.some((c) => c.text && !c.link),
        "no plain copyright line",
    );
    assert.ok(
        footer.copyright.some((c) => c.link),
        "no legal links",
    );
    for (const entry of footer.copyright) assert.equal(typeof entry.text, "string");
});

test("icon buttons carry inline SVG and are linked", () => {
    const icons = footer.buttons.filter((b) => b.icon);
    assert.ok(icons.length > 0, "no social buttons");
    for (const b of icons) {
        assert.ok(b.icon.trim().startsWith("<svg"), `${b.text}: icon is not inline SVG`);
        assert.ok(b.link, `${b.text}: icon button without a link`);
        assert.equal(typeof b.text, "string", "icon button needs text for its accessible name");
    }
});

test("every button has the text footer-buttons.html uses as its aria-label", () => {
    for (const b of footer.buttons) {
        assert.equal(typeof b.text, "string");
        assert.ok(b.text.length > 0);
    }
});

// The AI provider buttons are not in the feed — footer-ai-buttons.html carries
// marketing's provider list and inlines these icons from assets/. A missing
// file warns at build time and renders an empty 48px button, which is easy to
// miss on a dark footer.
test("every AI provider icon footer-ai-buttons.html inlines is present", () => {
    for (const name of ["chatgpt", "claude", "gemini", "grok", "perplexity"]) {
        const path = fileURLToPath(new URL(`../assets/icons/${name}.svg`, import.meta.url));
        assert.ok(existsSync(path), `assets/icons/${name}.svg is missing`);
        assert.ok(readFileSync(path, "utf8").trim().startsWith("<svg"), `${name}.svg is not an SVG document`);
    }
});

// Marketing's Footer.css is not loaded: the footer is styled with this theme's
// tokens. The one thing borrowed from marketing that the styling still depends
// on is the shape of its icons. footer-icon.html cuts the first two <path>
// children of each SVG (the dark tile and its grey outline) off with a regex,
// publishes the rest as a file and paints it in currentColor through a CSS
// mask. An icon redrawn in another shape would render as a filled square, or
// as an empty button, with nothing failing — so pin that shape for every icon
// the footer shows.
const topLevelPaths = (svg) => {
    // Direct children only: strip <defs> and <mask>, whose paths the CSS leaves alone.
    const body = svg.replace(/<defs[\s\S]*?<\/defs>/g, "").replace(/<mask[\s\S]*?<\/mask>/g, "");
    return [...body.matchAll(/<(path|g)\b[^>]*>/g)].map((m) => m[0]);
};

const footerIcons = [
    ...footer.buttons.filter((b) => b.icon).map((b) => [b.text, b.icon]),
    ...["chatgpt", "claude", "gemini", "grok", "perplexity"].map((name) => [
        name,
        readFileSync(fileURLToPath(new URL(`../assets/icons/${name}.svg`, import.meta.url)), "utf8"),
    ]),
];

test("every footer icon is a tile (two paths) followed by a glyph", () => {
    for (const [name, svg] of footerIcons) {
        const nodes = topLevelPaths(svg);
        assert.ok(nodes.length >= 3, `${name}: expected a tile, an outline and a glyph, got ${nodes.length} nodes`);
        assert.match(nodes[0], /^<path\b[^>]*fill="url\(#/, `${name}: first path is not the gradient tile`);
        assert.match(nodes[1], /^<path\b[^>]*stroke="/, `${name}: second path is not the tile outline`);
    }
});

// The same pattern footer-icon.html strips with replaceRE: both tile paths are
// self-closing and come right after the opening <svg>.
const TILE = /^\s*(<svg[^>]*>)\s*<path\b[^>]*\/>\s*<path\b[^>]*\/>/;

test("footer-icon.html's tile pattern matches every icon and leaves a glyph", () => {
    for (const [name, svg] of footerIcons) {
        assert.match(svg, TILE, `${name}: the tile paths aren't the first two self-closing children`);
        const glyph = svg.replace(TILE, "$1");
        assert.match(glyph, /<path\b/, `${name}: nothing left after cutting the tile`);
        assert.doesNotMatch(glyph, /stroke="#848486"/, `${name}: the tile outline survived`);
    }
});
