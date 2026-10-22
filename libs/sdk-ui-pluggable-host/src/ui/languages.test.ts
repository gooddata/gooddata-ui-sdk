// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { LANGUAGES, matchesLanguage } from "./languages.js";

describe("matchesLanguage", () => {
    it("should find a language by its English name", () => {
        const expected = ["ko-KR"];

        const actual = LANGUAGES.filter((language) => matchesLanguage(language, "korean"));

        expect(actual).toEqual(expected);
    });

    it("should find a language by its own name", () => {
        const expected = ["ko-KR"];

        const actual = LANGUAGES.filter((language) => matchesLanguage(language, "한국어"));

        expect(actual).toEqual(expected);
    });

    it("should find a language by its code", () => {
        const expected = ["nl-NL"];

        const actual = LANGUAGES.filter((language) => matchesLanguage(language, "nl"));

        expect(actual).toEqual(expected);
    });

    it("should find all variants of a language", () => {
        const expected = ["zh-HK", "zh-Hans", "zh-Hant"];

        const actual = LANGUAGES.filter((language) => matchesLanguage(language, "chin"));

        expect(actual).toEqual(expected);
    });

    it("should ignore case and diacritics", () => {
        const expected = ["fr-CA", "fr-FR"];

        const actual = LANGUAGES.filter((language) => matchesLanguage(language, "FRANCAIS"));

        expect(actual).toEqual(expected);
    });
});
