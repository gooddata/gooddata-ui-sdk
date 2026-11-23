// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type RichTextFeature } from "../plugins/remark-markdown-features.js";

import { getRichTextCharacters, getRichTextFormatsInRange } from "./richTextFormats.js";

const EMPHASIS: readonly RichTextFeature[] = ["emphasis"];
const LISTS: readonly RichTextFeature[] = ["emphasis", "lists"];
const NO_LISTS = { orderedList: false, bulletList: false };

// `[` and `]` mark the range and are not part of the text.
function formatsIn(marked: string, features: readonly RichTextFeature[] = EMPHASIS) {
    const start = marked.indexOf("[");
    const end = marked.indexOf("]") - 1;
    return getRichTextFormatsInRange(marked.replace("[", "").replace("]", ""), { start, end }, features);
}

describe("getRichTextFormatsInRange", () => {
    it.each([
        ["bold text", "**[foo]**", true, false],
        ["bold text with its markers", "[**foo**]", true, false],
        ["part of bold text", "**f[oo]**", true, false],
        ["bold text reaching out of the run", "**f[oo** b]ar", false, false],
        ["a range starting at the opener", "[**fo]o**", true, false],
        ["only the closing markers", "**foo[**]", false, false],
        ["only the opening markers", "[**]foo**", false, false],
        ["italic text", "_[foo]_", false, true],
        ["bold italic text", "***[foo]***", true, true],
        ["bold text with italic inside", "**[a _b_ c]**", true, false],
        ["italic text with bold inside", "_[a **b** c]_", false, true],
        ["plain text between bold runs", "**sa**[m]**ple**", false, false],
        ["two bold runs and the plain text between", "[**a** b **c**]", false, false],
        ["two bold runs and the space between", "[**a** **c**]", true, false],
        ["a bold variable", "**[{reportName}]**", true, false],
        ["escaped asterisks", "\\*\\*[foo]\\*\\*", false, false],
        ["only spaces", "**foo[ ]bar**", false, false],
        ["an empty range", "**foo[]**", false, false],
        ["bold across a line break", "**[a\nb]**", true, false],
    ])("reads %s", (_case, marked, strong, emphasis) => {
        expect(formatsIn(marked)).toEqual({ strong, emphasis, ...NO_LISTS });
    });

    it("reads markup the features leave out as text", () => {
        expect(formatsIn("**[foo]**", ["headings"])).toEqual({ strong: false, emphasis: false, ...NO_LISTS });
    });

    it.each([
        ["a space entity after bold text", "[**a** &nbsp;]", true],
        ["a space entity alone in a bold run", "[**&nbsp;**]", false],
        ["an ampersand entity after bold text", "[**a** &amp;]", false],
        ["an ampersand entity in a bold run", "[**&amp;**]", true],
    ])("reads %s", (_case, marked, strong) => {
        expect(formatsIn(marked, ["emphasis", "entities"])).toEqual({
            strong,
            emphasis: false,
            ...NO_LISTS,
        });
    });

    it("reads text in two paragraphs", () => {
        expect(formatsIn("**[a**\n\n**b]**")).toEqual({ strong: true, emphasis: false, ...NO_LISTS });
    });

    it.each([
        ["a bulleted item", "- [a]", false, true],
        ["a bulleted item with its marker", "[- a]", false, true],
        ["two bulleted items", "[- a\n- b]", false, true],
        ["a numbered item", "1. [a]", true, false],
        ["a numbered item written with a parenthesis", "[1) a]", true, false],
        ["a numbered and a bulleted item", "[1. a\n- b]", false, false],
        ["an item and the paragraph after it", "[- a\n\nb]", false, false],
        ["a plain line joined to the item above", "- a\n[b]", false, true],
        ["a numbered line that cannot interrupt a paragraph", "a\n[2. b]", false, false],
        ["a bulleted item inside a numbered one", "1. a\n   - [b]", false, true],
        ["a numbered item around a bulleted one", "[1. a\n   - b]", false, false],
        ["text with lists left out", "[- a]", false, false, EMPHASIS],
    ])("reads lists in %s", (_case, marked, orderedList, bulletList, features = LISTS) => {
        expect(formatsIn(marked, features)).toEqual({
            strong: false,
            emphasis: false,
            orderedList,
            bulletList,
        });
    });
});

describe("getRichTextCharacters", () => {
    // Each text character, followed by `b` when bold and `i` when italic.
    function rendered(value: string): string {
        return getRichTextCharacters(value, EMPHASIS)
            .characters.map(
                ({ offset, strong, emphasis }) =>
                    `${value.charAt(offset)}${strong ? "b" : ""}${emphasis ? "i" : ""}`,
            )
            .join("");
    }

    it.each([
        ["plain text", "ab", "ab"],
        ["bold and italic runs", "**a** _b_", "ab bi"],
        ["bold italic", "***a***", "abi"],
        ["an escaped marker, backslash included", "\\*a", "\\*a"],
        ["an entity, each of its characters", "&amp;", "&amp;"],
        ["markers that render nothing", "** a**", "** a**"],
    ])("reads %s", (_case, value, expected) => {
        expect(rendered(value)).toBe(expected);
    });

    it("reads how deep in lists each character is", () => {
        const value = "a\n\n- b\n  1. c\n- d";
        const depths = getRichTextCharacters(value, LISTS).characters.map(
            ({ offset, listDepth }) => `${value.charAt(offset)}${listDepth}`,
        );

        expect(depths).toEqual(["a0", "b1", "c2", "d1"]);
    });

    it("reports where the markers of each span are", () => {
        expect(getRichTextCharacters("x **_a_** y", EMPHASIS).spans).toEqual([
            { format: "strong", start: 2, end: 9, contentStart: 4, contentEnd: 7 },
            { format: "emphasis", start: 4, end: 7, contentStart: 5, contentEnd: 6 },
        ]);
    });

    it("reports where the markup of each link, highlight and strikethrough is", () => {
        const value = '[a ==b==](u "t") ~~c~~';
        expect(getRichTextCharacters(value, ["links", "highlight", "strikethrough"]).elements).toEqual([
            { element: "link", start: 0, end: 16, contentStart: 1, contentEnd: 8 },
            { element: "highlight", start: 3, end: 8, contentStart: 5, contentEnd: 6 },
            { element: "strikethrough", start: 17, end: 22, contentStart: 19, contentEnd: 20 },
        ]);
    });

    it.each([
        ["brackets", "[not a link]", ["links"]],
        ["an equals sign", "a == b", ["highlight"]],
        ["an escaped bracket", "\\[a](u)", ["links"]],
        ["markup the features leave out", "==a== [b](u)", ["emphasis"]],
    ] as const)("reports no element for %s", (_case, value, features) => {
        expect(getRichTextCharacters(value, features).elements).toEqual([]);
    });

    it.each([
        ["a named entity", "a&nbsp;b", [{ start: 1, end: 7, text: "\u00a0" }]],
        ["a decimal entity", "a&#32;b", [{ start: 1, end: 6, text: " " }]],
        ["a hexadecimal entity", "a&#xA0;b", [{ start: 1, end: 7, text: "\u00a0" }]],
        ["a name that is no entity", "a&nope;b", []],
        ["an escaped ampersand", "a\\&nbsp;b", []],
    ] as const)("reports %s with the text it draws", (_case, value, entities) => {
        expect(getRichTextCharacters(value, ["entities"]).entities).toEqual(entities);
    });
});
