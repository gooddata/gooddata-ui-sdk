// (C) 2007-2024 GoodData Corporation
import { expect, describe, it } from "vitest";
import { removeMetadata, sanitizeLocaleForMoment } from "../translationUtils.js";

const translations = {
    "some.key.1": {
        value: "value1",
        comment: "Some comment",
        limit: 0,
    },
    "some.key.2": {
        value: "value2",
        comment: "Some comment",
        limit: 0,
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

    it.each(["de-DE", "en-US", "es-ES", "fr-FR", "ja-JP", "nl-NL", "pt-BR", "pt-PT", "ru-RU", "it-IT"])(
        "should not touch %s locale",
        (value: string) => {
            const expected = value;
            const actual = sanitizeLocaleForMoment(value);
            expect(actual).toEqual(expected);
        },
    );

    it("should not fail with falsy value", () => {
        const actual = sanitizeLocaleForMoment(undefined);
        expect(actual).toBeUndefined();
    });
});
