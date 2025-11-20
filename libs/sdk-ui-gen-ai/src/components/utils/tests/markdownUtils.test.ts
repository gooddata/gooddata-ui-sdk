// (C) 2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { escapeMarkdown } from "../markdownUtils.js";

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
