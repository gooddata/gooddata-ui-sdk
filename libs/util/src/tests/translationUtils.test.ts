// (C) 2007-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { removeMetadata, sanitizeLocaleForMoment } from "../translationUtils.js";

const translations = {
    "some.key.1": {
        text: "value1",
        crowdinContext: "Some comment",
    },
    "some.key.2": {
        text: "value2",
        crowdinContext: "Some comment",
    },
};

const translationsWithoutMetadata = {
    "some.key.1": "value1",
    "some.key.2": "value2",
};

describe("translations removeMetadata", () => {
    it("should remove metadata from translations", () => {
        expect(removeMetadata(translations)).toEqual(translationsWithoutMetadata);
    });
});

describe("sanitizeLocaleForMoment", () => {
    it("should sanitize the zh-Hans locale", () => {
        const expected = "zh-CN";
        const actual = sanitizeLocaleForMoment("zh-Hans");
        expect(actual).toEqual(expected);
    });

    it("should sanitize the zh-Hant locale", () => {
        const expected = "zh-CN";
        const actual = sanitizeLocaleForMoment("zh-Hant");
        expect(actual).toEqual(expected);
    });

    it("should sanitize the zh-HK locale", () => {
        const expected = "zh-CN";
        const actual = sanitizeLocaleForMoment("zh-HK");
        expect(actual).toEqual(expected);
    });

    it.each([
        "de-DE",
        "en-US",
        "es-ES",
        "fr-FR",
        "ja-JP",
        "nl-NL",
        "pt-BR",
        "pt-PT",
        "ru-RU",
        "it-IT",
        "es-419",
        "fr-CA",
        "en-GB",
        "en-AU",
        "fi-FI",
        "tr-TR",
        "pl-PL",
        "ko-KR",
        "sl-SI",
    ])("should not touch %s locale", (value: string) => {
        const expected = value;
        const actual = sanitizeLocaleForMoment(value);
        expect(actual).toEqual(expected);
    });

    it("should not fail with falsy value", () => {
        const actual = sanitizeLocaleForMoment(undefined as unknown as string);
        expect(actual).toBeUndefined();
    });
});
