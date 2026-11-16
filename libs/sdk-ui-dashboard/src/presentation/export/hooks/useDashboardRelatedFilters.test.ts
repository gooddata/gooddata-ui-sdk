// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { elementsDisplayTitles } from "./useDashboardRelatedFilters.js";

describe("elementsDisplayTitles", () => {
    const elements = [
        { title: "1234.5", uri: "1234.5" },
        { title: "abc", uri: "abc" },
        { title: null, uri: null },
    ];

    it("formats numeric values by the number format of the elements with the separators", () => {
        expect(elementsDisplayTitles(elements, "#,##0.0", { decimal: ",", thousand: " " })).toEqual([
            "1 234,5",
            "abc",
            null,
        ]);
    });

    it("keeps the raw titles without a number format", () => {
        expect(elementsDisplayTitles(elements, undefined, { decimal: ",", thousand: " " })).toEqual([
            "1234.5",
            "abc",
            null,
        ]);
    });

    it("uses the formatted title of an element that carries one, as the filter does", () => {
        const dateElements = [
            { title: "2024-01-15", formattedTitle: "Jan 15, 2024", uri: "2024-01-15" },
            { title: "2024-02-01", uri: "2024-02-01" },
        ];

        expect(elementsDisplayTitles(dateElements, undefined, undefined)).toEqual([
            "Jan 15, 2024",
            "2024-02-01",
        ]);
    });

    it("prefers the formatted title over the number format", () => {
        const mixedElements = [
            { title: "1234.5", formattedTitle: "Custom 1234.5", uri: "1234.5" },
            { title: "5678.5", uri: "5678.5" },
        ];

        expect(elementsDisplayTitles(mixedElements, "#,##0.0", { decimal: ",", thousand: " " })).toEqual([
            "Custom 1234.5",
            "5 678,5",
        ]);
    });
});
