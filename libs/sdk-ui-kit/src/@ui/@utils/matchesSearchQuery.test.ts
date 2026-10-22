// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { matchesSearchQuery } from "./matchesSearchQuery.js";

describe("matchesSearchQuery", () => {
    it("should match a query anywhere in the text", () => {
        const texts = ["Banana", "Pineapple"];
        const query = "apple";
        const expected = ["Pineapple"];

        const actual = texts.filter((text) => matchesSearchQuery(text, query));

        expect(actual).toEqual(expected);
    });

    it("should ignore case", () => {
        const texts = ["Apple", "Banana"];
        const query = "apple";
        const expected = ["Apple"];

        const actual = texts.filter((text) => matchesSearchQuery(text, query));

        expect(actual).toEqual(expected);
    });

    it("should ignore diacritics in the text", () => {
        const texts = ["Červená", "Žltá"];
        const query = "zlta";
        const expected = ["Žltá"];

        const actual = texts.filter((text) => matchesSearchQuery(text, query));

        expect(actual).toEqual(expected);
    });

    it("should ignore diacritics of letters that do not decompose", () => {
        // NOTE: "ł" has no decomposed form ("l" + combining mark), unlike "ó" and "ź".
        const texts = ["Łódź", "Warszawa"];
        const query = "lodz";
        const expected = ["Łódź"];

        const actual = texts.filter((text) => matchesSearchQuery(text, query));

        expect(actual).toEqual(expected);
    });
});
