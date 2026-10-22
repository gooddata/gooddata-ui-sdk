// (C) 2026 GoodData Corporation

import assert from "node:assert/strict";
import test from "node:test";

import { JSDOM } from "jsdom";

import { rewriteMdLinks } from "../assets/js/content-fixup.js";

test("rewrites trailing .md links to slash", () => {
    const dom = new JSDOM(`<main><a href="foo/bar.md">x</a><a href="/keep/">y</a></main>`);
    rewriteMdLinks(dom.window.document.querySelector("main"));
    const hrefs = [...dom.window.document.querySelectorAll("a")].map((a) => a.getAttribute("href"));
    assert.deepEqual(hrefs, ["foo/bar/", "/keep/"]);
});

test("keeps links to a page's Markdown copy (index.md)", () => {
    const dom = new JSDOM(
        `<main><a href="../installation/index.md">x</a><a href="index.md">y</a><a href="/a/reindex.md">z</a></main>`,
    );
    rewriteMdLinks(dom.window.document.querySelector("main"));
    const hrefs = [...dom.window.document.querySelectorAll("a")].map((a) => a.getAttribute("href"));
    assert.deepEqual(hrefs, ["../installation/index.md", "index.md", "/a/reindex/"]);
});

test("leaves .md links to other hosts alone", () => {
    const dom = new JSDOM(
        `<main><a href="https://github.com/gooddata/gooddata-ui-sdk/blob/master/CHANGELOG.md">x</a><a href="//example.com/a.md">y</a><a href="https://docs.test/a/b.md">z</a></main>`,
        { url: "https://docs.test/latest/" },
    );
    rewriteMdLinks(dom.window.document.querySelector("main"));
    const hrefs = [...dom.window.document.querySelectorAll("a")].map((a) => a.getAttribute("href"));
    assert.deepEqual(hrefs, [
        "https://github.com/gooddata/gooddata-ui-sdk/blob/master/CHANGELOG.md",
        "//example.com/a.md",
        "https://docs.test/a/b/",
    ]);
});
