// (C) 2025-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { escapeMarkdown, removeMarkdown } from "../markdownUtils.js";

describe("escapeMarkdown", () => {
    it.each([
        ["\\", "\\\\"],
        ["`", "\\`"],
        ["*", "\\*"],
        ["_", "\\_"],
        ["{", "\\{"],
        ["}", "\\}"],
        ["[", "\\["],
        ["]", "\\]"],
        ["(", "\\("],
        [")", "\\)"],
        ["#", "\\#"],
        ["+", "\\+"],
        ["-", "\\-"],
        [".", "\\."],
        ["!", "\\!"],
    ])("escapes reserved markdown character %s", (input, expected) => {
        expect(escapeMarkdown(input)).toBe(expected);
    });

    it("escapes multiple reserved characters in a string", () => {
        expect(escapeMarkdown("Hello [markdown] #1!")).toBe("Hello \\[markdown\\] \\#1\\!");
    });

    it("does not escape characters inside braces 1", () => {
        expect(escapeMarkdown("{dashboard.bar} #1")).toBe("{dashboard.bar} \\#1");
    });

    it("does not escape characters inside braces 2", () => {
        expect(escapeMarkdown("{test/#*dashboard_bar} #1")).toBe("{test/#*dashboard_bar} \\#1");
    });

    it("keeps braces themselves escaped outside placeholders", () => {
        expect(escapeMarkdown("Look at {this} and {that}\nUse {")).toBe("Look at {this} and {that}\nUse \\{");
    });
});

describe("removeMarkdown", () => {
    it("should remove bold and italic", () => {
        expect(removeMarkdown("This is **bold** and *italic*")).toBe("This is bold and italic");
        expect(removeMarkdown("This is __bold__ and _italic_")).toBe("This is bold and italic");
    });

    it("should remove links", () => {
        expect(removeMarkdown("Click [here](http://example.com)")).toBe("Click here");
    });

    it("should remove inline code", () => {
        expect(removeMarkdown("Use `code` tag")).toBe("Use code tag");
    });

    it("should remove headers", () => {
        expect(removeMarkdown("# Header 1\n## Header 2")).toBe("Header 1 Header 2");
    });

    it("should remove blockquotes", () => {
        expect(removeMarkdown("> This is a quote")).toBe("This is a quote");
    });

    it("should remove list marks", () => {
        expect(removeMarkdown("- item 1\n* item 2\n+ item 3")).toBe("item 1 item 2 item 3");
        expect(removeMarkdown("1. item 1\n2. item 2")).toBe("item 1 item 2");
    });

    it("should replace newlines with space", () => {
        expect(removeMarkdown("Line 1\nLine 2\r\nLine 3")).toBe("Line 1 Line 2 Line 3");
    });

    it("should remove double spaces", () => {
        expect(removeMarkdown("Word1    Word2")).toBe("Word1 Word2");
    });

    it("should handle complex markdown", () => {
        const input = `
# Title
This is a **bold** statement with a [link](url).
- List item 1
- List item 2
> Quote here
\`code block\`
`;
        const expected =
            "Title This is a bold statement with a link. List item 1 List item 2 Quote here code block";
        expect(removeMarkdown(input)).toBe(expected);
    });
});
