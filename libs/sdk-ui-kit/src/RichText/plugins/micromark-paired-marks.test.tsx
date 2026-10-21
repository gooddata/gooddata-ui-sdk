// (C) 2026 GoodData Corporation

import { renderToStaticMarkup } from "react-dom/server";
import Markdown from "react-markdown";
import { describe, expect, it } from "vitest";

import {
    ALL_RICH_TEXT_FEATURES,
    type RichTextFeature,
    remarkMarkdownFeatures,
} from "./remark-markdown-features.js";

const FEATURES: readonly RichTextFeature[] = [
    "emphasis",
    "links",
    "code",
    "highlight",
    "strikethrough",
    "backslashBreaks",
    "lists",
];

function render(value: string, features: readonly RichTextFeature[] = FEATURES): string {
    return renderToStaticMarkup(
        <Markdown remarkPlugins={[remarkMarkdownFeatures(features)]}>{value}</Markdown>,
    );
}

describe("highlight", () => {
    it.each([
        ["a whole paragraph", "==hi==", "<p><mark>hi</mark></p>"],
        ["intraword", "a==b==c", "<p>a<mark>b</mark>c</p>"],
        ["around bold", "a ==**bold** text== b", "<p>a <mark><strong>bold</strong> text</mark> b</p>"],
        ["inside bold", "**==x==**", "<p><strong><mark>x</mark></strong></p>"],
        ["wrapping bold", "==**x**==", "<p><mark><strong>x</strong></mark></p>"],
        [
            "inside a link",
            "[==l==](https://x.example)",
            '<p><a href="https://x.example"><mark>l</mark></a></p>',
        ],
    ])("marks up %s", (_name, input, expected) => {
        expect(render(input)).toBe(expected);
    });

    it.each([
        ["an escaped opener", "\\==x==", "<p>==x==</p>"],
        ["a run of three", "===x===", "<p>===x===</p>"],
        ["an unpaired run", "==x", "<p>==x</p>"],
        ["a spaced comparison", "x == y", "<p>x == y</p>"],
        ["a code span", "`==x==`", "<p><code>==x==</code></p>"],
    ])("leaves %s as typed", (_name, input, expected) => {
        expect(render(input)).toBe(expected);
    });

    // Were `=` an attention marker, the `*` before it could open emphasis and close after `b`.
    it("does not let an equals sign open emphasis beside it", () => {
        expect(render("a*=b* c")).toBe("<p>a*=b* c</p>");
    });
});

describe("strikethrough", () => {
    it.each([
        ["double tildes but not single ones", "~~gone~~ ~one~", "<p><del>gone</del> ~one~</p>"],
        ["intraword", "a~~b~~c", "<p>a<del>b</del>c</p>"],
        // `~` is an attention marker, as in GFM, so the bold beside it opens and closes intraword.
        ["inside intraword bold", "x**~~y~~**z", "<p>x<strong><del>y</del></strong>z</p>"],
        ["around a highlight", "~~a ==b== c~~", "<p><del>a <mark>b</mark> c</del></p>"],
    ])("marks up %s", (_name, input, expected) => {
        expect(render(input)).toBe(expected);
    });

    it("leaves an escaped opener as typed", () => {
        expect(render("\\~~x~~")).toBe("<p>~~x~~</p>");
    });

    // With code on, three tildes open a fenced code block instead.
    it("leaves a run of three as typed when code is off", () => {
        expect(render("~~~a~~~", ["emphasis", "highlight", "strikethrough"])).toBe("<p>~~~a~~~</p>");
    });
});

describe("paired marks as features", () => {
    it("leaves both as typed unless they are asked for", () => {
        expect(render("==hi== ~~gone~~", ["emphasis"])).toBe("<p>==hi== ~~gone~~</p>");
    });

    it("keeps both out of the CommonMark set", () => {
        expect(ALL_RICH_TEXT_FEATURES).not.toContain("strikethrough");
        expect(ALL_RICH_TEXT_FEATURES).not.toContain("highlight");
    });
});
