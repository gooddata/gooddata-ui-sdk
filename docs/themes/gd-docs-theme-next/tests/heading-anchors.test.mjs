// (C) 2026 GoodData Corporation

import assert from "node:assert/strict";
import test from "node:test";

import { JSDOM } from "jsdom";

import { addHeadingAnchors, headingUrl } from "../assets/js/heading-anchors.js";

const page = (body) =>
    new JSDOM(`<main id="main-content">${body}</main>`, { url: "https://x.test/docs/page/?q=1" });

test("adds one anchor link to each content heading with an id", () => {
    const dom = page(
        `<div class="prose"><h2 id="a">A</h2><h3 id="b">B</h3><h3>no id</h3></div><h2 id="out">outside</h2>`,
    );
    const main = dom.window.document.getElementById("main-content");
    addHeadingAnchors(main);
    addHeadingAnchors(main);
    const links = [...main.querySelectorAll(".gd-heading-anchor")].map((a) => a.getAttribute("href"));
    assert.deepEqual(links, ["#a", "#b"]);
});

test("skips headings inside a link", () => {
    const dom = page(`<div class="prose"><a href="/card/"><h3 id="card">Card</h3></a></div>`);
    const main = dom.window.document.getElementById("main-content");
    addHeadingAnchors(main);
    assert.equal(main.querySelectorAll(".gd-heading-anchor").length, 0);
});

test("headingUrl drops the query string and keeps the anchor", () => {
    const { location } = page("").window;
    assert.equal(headingUrl(location, "ichartconfigcolors"), "https://x.test/docs/page/#ichartconfigcolors");
});

test("a click copies the section URL and updates the address bar", async () => {
    const dom = page(`<div class="prose"><h2 id="props">Props</h2></div>`);
    const { document, location, history, MouseEvent } = dom.window;
    let copied = "";
    addHeadingAnchors(document.getElementById("main-content"), {
        clipboard: { writeText: async (t) => (copied = t) },
        location,
        history,
    });
    const a = document.querySelector(".gd-heading-anchor");
    a.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    await new Promise((r) => setTimeout(r, 0));
    assert.equal(copied, "https://x.test/docs/page/#props");
    assert.equal(location.hash, "#props");
    assert.equal(a.dataset.copied, "true");
});
