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
});
