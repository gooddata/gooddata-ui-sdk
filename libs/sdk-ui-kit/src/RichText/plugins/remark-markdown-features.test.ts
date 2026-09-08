// (C) 2026 GoodData Corporation

import { type Nodes } from "mdast";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { describe, expect, it } from "vitest";

import {
    ALL_RICH_TEXT_FEATURES,
    type RichTextFeature,
    remarkMarkdownFeatures,
} from "./remark-markdown-features.js";

// react-markdown parses with remark-parse and the plugins it is given, so this is the tree the
// component renders from.
function parse(value: string, features: readonly RichTextFeature[]): Nodes {
    return unified().use(remarkParse).use(remarkMarkdownFeatures(features)).parse(value);
}

function serialize(node: Nodes): string {
    switch (node.type) {
        case "text":
            return node.value;
        case "strong":
            return `<strong>${node.children.map(serialize).join("")}</strong>`;
        case "emphasis":
            return `<em>${node.children.map(serialize).join("")}</em>`;
        case "break":
            return "<br>";
        case "paragraph":
            return node.children.map(serialize).join("");
        case "root":
            return node.children.map(serialize).join("\n\n");
        default:
            return `<${node.type}>`;
    }
}

const emphasisOnly = (value: string) => serialize(parse(value, ["emphasis"]));

// The `it.each` labels name a spelling rather than a feature, so the feature is the first word.
function featureOf(label: string): RichTextFeature {
    return label.split(",")[0] as RichTextFeature;
}

function nodeTypes(node: Nodes): Set<string> {
    const nested = "children" in node ? node.children.flatMap((child) => [...nodeTypes(child)]) : [];
    return new Set([node.type, ...nested]);
}

describe("remarkMarkdownFeatures", () => {
    describe("narrowed to emphasis", () => {
        it.each([
            ["bold", "**bold**", "<strong>bold</strong>"],
            ["italic with underscores", "_italic_", "<em>italic</em>"],
            ["italic with asterisks", "*italic*", "<em>italic</em>"],
            ["both at once", "***both***", "<em><strong>both</strong></em>"],
            ["emphasis mid-sentence", "a **b** c", "a <strong>b</strong> c"],
            ["intraword bold", "sa**m**ple", "sa<strong>m</strong>ple"],
        ])("marks up %s", (_name, input, expected) => {
            expect(emphasisOnly(input)).toBe(expected);
        });

        it.each([
            ["headingAtx", "# Heading", "# Heading"],
            ["setextUnderline", "Heading\n=======", "Heading\n======="],
            ["list, bulleted", "* one\n* two", "* one\n* two"],
            ["list, numbered", "1. one\n2. two", "1. one\n2. two"],
            ["blockQuote", "> quoted", "> quoted"],
            ["thematicBreak, dashes", "---", "---"],
            ["thematicBreak, asterisks", "***", "***"],
            ["thematicBreak, underscores", "____", "____"],
            ["codeText", "`code`", "`code`"],
            ["codeFenced", "```\ncode\n```", "```\ncode\n```"],
            ["labelStartLink", "[label](http://x.example)", "[label](http://x.example)"],
            ["labelStartImage", "![alt](http://x.example/i.png)", "![alt](http://x.example/i.png)"],
            ["definition", "[1]: http://x.example", "[1]: http://x.example"],
            ["autolink", "<http://x.example>", "<http://x.example>"],
            ["htmlFlow", "<div>block</div>", "<div>block</div>"],
            ["htmlText", "an <b>inline</b> tag", "an <b>inline</b> tag"],
            ["characterReference", "&amp; and &#38;", "&amp; and &#38;"],
            ["hardBreakEscape", "line\\\nnext", "line\\\nnext"],
            ["a table, which was never markdown here", "| a | b |\n| - | - |", "| a | b |\n| - | - |"],
        ])("leaves %s as the characters that were typed", (_construct, input, expected) => {
            expect(emphasisOnly(input)).toBe(expected);
        });

        // Indented code is the one disabled construct whose markers cannot survive, because the
        // flow tokenizer strips a paragraph's leading whitespace whether or not anything reads it.
        it("keeps indented text as text, minus its indent", () => {
            expect(emphasisOnly("    indented")).toBe("indented");
        });

        it("escapes a literal emphasis marker, the only way left to write one", () => {
            expect(emphasisOnly("escaped \\*not bold\\*")).toBe("escaped *not bold*");
        });

        it("keeps a backslash that escapes nothing", () => {
            expect(emphasisOnly("C:\\Users\\name")).toBe("C:\\Users\\name");
        });

        it("keeps paragraphs and trailing-whitespace line breaks", () => {
            expect(emphasisOnly("one\n\ntwo")).toBe("one\n\ntwo");
            expect(emphasisOnly("one  \ntwo")).toBe("one<br>two");
        });

        // A bare newline stays inside the text, so only `white-space` decides whether it shows.
        it("keeps a bare newline inside the text rather than making it a break", () => {
            expect(emphasisOnly("one\ntwo")).toBe("one\ntwo");
        });
    });

    describe("one feature at a time", () => {
        // One row per construct in the feature, not one per feature: a group whose members are
        // independent can lose one silently, and only the syntax that member owns would notice.
        it.each([
            ["emphasis", "**bold** _italic_", ["strong", "emphasis"]],
            ["headings, atx", "# atx", ["heading"]],
            ["headings, setext", "setext\n======", ["heading"]],
            ["lists, bulleted", "* one\n* two", ["list", "listItem"]],
            ["lists, numbered", "1. one", ["list", "listItem"]],
            ["links, inline", "[label](http://x.example)", ["link"]],
            ["links, by reference", "[ref][1]\n\n[1]: http://x.example", ["linkReference", "definition"]],
            ["links, autolink", "<http://x.example>", ["link"]],
            ["images", "![alt](http://x.example/i.png)", ["image"]],
            ["code, span", "`span`", ["inlineCode"]],
            ["code, fenced", "```\nfenced\n```", ["code"]],
            ["code, indented", "    indented", ["code"]],
            ["blockquotes", "> quoted", ["blockquote"]],
            ["thematicBreaks", "---", ["thematicBreak"]],
            ["html, flow", "<div>block</div>", ["html"]],
            ["html, inline", "an <b>inline</b> tag", ["html"]],
            ["backslashBreaks", "line\\\nnext", ["break"]],
        ] as const)("recognises %s on its own", (feature, input, expected) => {
            const types = nodeTypes(parse(input, [featureOf(feature)]));

            expect([...types]).toEqual(expect.arrayContaining([...expected]));
        });

        it("recognises an entity on its own", () => {
            expect(serialize(parse("&amp;", ["entities"]))).toBe("&");
        });

        // The shape that decides the whole design: an image needs `labelEnd`, which `links` also
        // owns, so links without images take the brackets and leave the bang behind.
        it("renders an image as a link and a stray bang when links are on and images are not", () => {
            expect(serialize(parse("![alt](http://x.example/i.png)", ["links"]))).toBe("!<link>");
        });

        it("leaves every other feature's syntax alone", () => {
            const types = nodeTypes(parse("# heading\n\n* list\n\n`code`\n\n> quote", ["emphasis"]));

            expect([...types].sort()).toEqual(["paragraph", "root", "text"]);
        });
    });

    // A construct no feature claims could never be switched back on, which the arithmetic alone
    // would not show: it would simply stay off with nothing naming it. A construct added to
    // NAMED_CONSTRUCTS needs its syntax added here, or it escapes that check.
    it("recognises the whole of markdown when every feature is asked for", () => {
        const everything = [
            "# atx",
            "setext\n======",
            "**bold** _italic_",
            "* one\n* two",
            "1. numbered",
            "> quoted",
            "---",
            "`span`",
            "```\nfenced\n```",
            "    indented",
            "[label](http://x.example)",
            "![alt](http://x.example/i.png)",
            "[ref][1]\n\n[1]: http://x.example",
            "<http://x.example>",
            "<div>block</div>",
            "an <b>inline</b> tag",
            "&amp;",
            "line\\\nnext",
        ].join("\n\n");

        expect(parse(everything, ALL_RICH_TEXT_FEATURES)).toEqual(
            unified().use(remarkParse).parse(everything),
        );
    });

    it("recognises nothing when no feature is asked for", () => {
        const types = nodeTypes(parse("**bold** # heading [label](http://x.example)", []));

        expect([...types].sort()).toEqual(["paragraph", "root", "text"]);
    });
});
