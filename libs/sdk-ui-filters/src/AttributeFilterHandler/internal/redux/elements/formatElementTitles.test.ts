// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IAttributeElement } from "@gooddata/sdk-model";

import { formatElementTitlesMap } from "./formatElementTitles.js";

const elements: IAttributeElement[] = [
    { title: "1234.5", uri: "1234.5" },
    { title: "Gold", uri: "Gold" },
    { title: "", uri: "" },
    { title: null, uri: null },
    { title: "20260101", uri: "20260101", formattedTitle: "Jan 2026" },
];

const separators = { thousand: " ", decimal: "," };

describe("formatElementTitlesMap", () => {
    const cache: Record<string, IAttributeElement> = {
        "1234.5": elements[0],
        Gold: elements[1],
        "20260101": elements[4],
    };

    it("formats numeric element titles and keeps the keys", () => {
        const formatted = formatElementTitlesMap(cache, "#,##0.0", separators);

        expect(Object.keys(formatted)).toEqual(Object.keys(cache));
        expect(formatted["1234.5"]).toEqual({ title: "1234.5", uri: "1234.5", formattedTitle: "1 234,5" });
        // untouched entries keep their identity
        expect(formatted["Gold"]).toBe(cache["Gold"]);
        expect(formatted["20260101"]).toBe(cache["20260101"]);
    });

    it("returns the same object without a number format or when nothing is formatted", () => {
        expect(formatElementTitlesMap(cache, undefined, separators)).toBe(cache);

        const nothingToFormat = { Gold: elements[1], "20260101": elements[4] };
        expect(formatElementTitlesMap(nothingToFormat, "#,#.##", undefined)).toBe(nothingToFormat);
    });
});
