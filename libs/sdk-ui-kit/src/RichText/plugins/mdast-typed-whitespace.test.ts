// (C) 2026 GoodData Corporation

import { type Nodes } from "mdast";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { describe, expect, it } from "vitest";

import { type RichTextFeature, remarkMarkdownFeatures } from "./remark-markdown-features.js";

const PROSE: readonly RichTextFeature[] = ["emphasis", "lists", "blockquotes", "headings"];

function parse(value: string, features: readonly RichTextFeature[]): Nodes {
    return unified().use(remarkParse).use(remarkMarkdownFeatures(features)).parse(value);
}

// A block per line, nested blocks indented, text in quotes: enough to tell the structure apart.
function outline(node: Nodes, depth = 0): string[] {
    const pad = "  ".repeat(depth);
    switch (node.type) {
        case "text":
            return [`${pad}${JSON.stringify(node.value)}`];
        case "root":
            return node.children.flatMap((child) => outline(child, depth));
        default:
            return [
                `${pad}${node.type}`,
                ...("children" in node ? node.children.flatMap((child) => outline(child, depth + 1)) : []),
            ];
    }
}

const typed = (value: string) => outline(parse(value, [...PROSE, "typedWhitespace"]));
const commonMark = (value: string) => outline(parse(value, PROSE));

describe("typedWhitespace", () => {
    it.each([
        ["one blank line", "a\n\nb", ["paragraph", '  "a"', "paragraph", '  "b"']],
        ["two blank lines", "a\n\n\nb", ["paragraph", '  "a"', "blankLine", "paragraph", '  "b"']],
        [
            "three blank lines",
            "a\n\n\n\nb",
            ["paragraph", '  "a"', "blankLine", "blankLine", "paragraph", '  "b"'],
        ],
        [
            "blank lines before a heading",
            "a\n\n\n# b",
            ["paragraph", '  "a"', "blankLine", "heading", '  "b"'],
        ],
    ])("keeps every line of %s", (_name, value, expected) => {
        expect(typed(value)).toEqual(expected);
    });

    it.each([
        ["the first line", "   a", ["paragraph", '  "   a"']],
        ["a later line", "a\n    b", ["paragraph", '  "a\\n    b"']],
        ["a line in a quote", ">    a", ["blockquote", "  paragraph", '    "   a"']],
    ])("keeps the indentation of %s", (_name, value, expected) => {
        expect(typed(value)).toEqual(expected);
    });

    it.each([
        ["an = underline", "Title\n  ==="],
        ["a - underline", "Title\n   ---"],
    ])("leaves the indentation of %s out of the heading", (_name, value) => {
        expect(typed(value)).toEqual(["heading", '  "Title"']);
    });

    it("keeps the indentation of a heading's later line", () => {
        expect(typed("Title\n  more\n===")).toEqual(["heading", '  "Title\\n  more"']);
    });

    it.each([
        ["a nested list", "- a\n  - b"],
        ["a list item's second paragraph", "- a\n\n  b"],
        ["a quote's continuation", "> a\n> b"],
        ["an indented heading", "  # a"],
    ])("leaves the structure of %s as it is", (_name, value) => {
        expect(typed(value)).toEqual(commonMark(value));
    });

    it.each([
        ["one blank line", "\na", ["blankLine", "paragraph", '  "a"']],
        ["three blank lines", "\n\n\na", ["blankLine", "blankLine", "blankLine", "paragraph", '  "a"']],
        ["a line of spaces", "  \n\na", ["blankLine", "blankLine", "paragraph", '  "a"']],
        [
            "blank lines before a list",
            "\n\n- a",
            ["blankLine", "blankLine", "list", "  listItem", "    paragraph", '      "a"'],
        ],
        [
            "blank lines before a quote",
            "\n\n> a",
            ["blankLine", "blankLine", "blockquote", "  paragraph", '    "a"'],
        ],
        ["blank lines before a heading", "\n\n# a", ["blankLine", "blankLine", "heading", '  "a"']],
    ])("keeps every line of %s above the first block", (_name, value, expected) => {
        expect(typed(value)).toEqual(expected);
    });

    it.each([
        ["text that starts with a block", "a"],
        ["a list item", "- a"],
        ["a quote", "> a"],
    ])("puts no blank line above the first block of %s", (_name, value) => {
        expect(typed(value)).toEqual(commonMark(value));
    });

    it.each([
        ["one line after a paragraph", "a\n", ["paragraph", '  "a"', "blankLine"]],
        [
            "three lines after a paragraph",
            "a\n\n\n",
            ["paragraph", '  "a"', "blankLine", "blankLine", "blankLine"],
        ],
        [
            "three lines after a list",
            "- a\n\n\n",
            ["list", "  listItem", "    paragraph", '      "a"', "blankLine", "blankLine", "blankLine"],
        ],
        [
            "three lines after a quote",
            "> a\n\n\n",
            ["blockquote", "  paragraph", '    "a"', "blankLine", "blankLine", "blankLine"],
        ],
    ])("keeps every one of %s", (_name, value, expected) => {
        expect(typed(value)).toEqual(expected);
    });

    it.each([
        ["one newline", "\n", 2],
        ["three newlines", "\n\n\n", 4],
        ["a line of spaces", "   ", 1],
        ["lines of spaces", " \n \n", 3],
        ["nothing", "", 0],
    ])("draws text of %s as its blank lines", (_name, value, count) => {
        expect(typed(value)).toEqual(Array.from({ length: count }, () => "blankLine"));
    });

    it("puts no blank line between list items", () => {
        expect(typed("- a\n\n\n- b")).toEqual(commonMark("- a\n\n\n- b"));
    });

    it("forgets one value's indentation before the next is parsed", () => {
        const processor = unified()
            .use(remarkParse)
            .use(remarkMarkdownFeatures([...PROSE, "typedWhitespace"]));
        processor.parse("   a");

        // "b" starts at offset 3, where "   a" left its indentation.
        expect(outline(processor.parse("a\n\nb"))).toEqual(["paragraph", '  "a"', "paragraph", '  "b"']);
    });

    it("is off unless asked for", () => {
        expect(commonMark("   a\n\n\n\nb")).toEqual(["paragraph", '  "a"', "paragraph", '  "b"']);
    });
});
