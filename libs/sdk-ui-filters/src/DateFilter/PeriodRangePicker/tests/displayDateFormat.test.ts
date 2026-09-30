// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { toDisplayDateFormat } from "../displayDateFormat.js";

describe("toDisplayDateFormat", () => {
    it.each([
        ["M/d/y", "M/d/YYYY"],
        ["dd/MM/y", "dd/MM/YYYY"],
        ["y.MM.dd", "YYYY.MM.dd"],
        ["MM/dd/yyyy", "MM/dd/YYYY"],
        ["d/M/yy", "d/M/YY"],
        ["yyyy-'year'-MM-dd", "YYYY-year-MM-dd"],
        ["yyyy-MM-dd'T'", "YYYY-MM-ddT"],
    ])("rewrites %s to %s", (input, expected) => {
        expect(toDisplayDateFormat(input)).toBe(expected);
    });
});
