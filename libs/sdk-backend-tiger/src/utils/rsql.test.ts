// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { rsqlQuote, rsqlSingleQuote } from "./rsql.js";

describe("rsqlQuote", () => {
    it.each([
        ["Retail", '"Retail"'],
        ["Bob's workspace", '"Bob\'s workspace"'],
        ['The "core" one', '"The \\"core\\" one"'],
        ["C:\\data", '"C:\\\\data"'],
    ])("quotes %s", (value, expected) => {
        expect(rsqlQuote(value)).toBe(expected);
    });
});

describe("rsqlSingleQuote", () => {
    it.each([
        ["Retail", "'Retail'"],
        ["Bob's workspace", "'Bob\\'s workspace'"],
        ['The "core" one', "'The \"core\" one'"],
        ["C:\\data", "'C:\\\\data'"],
    ])("quotes %s", (value, expected) => {
        expect(rsqlSingleQuote(value)).toBe(expected);
    });
});
