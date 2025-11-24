// (C) 2007-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { getIntl, getTranslation } from "../IntlStore.js";
import { DefaultLocale, ILocale } from "../Locale.js";

describe("IntlStore", () => {
    describe("getIntl", () => {
        it("should return intlProvider for default locale (en-US)", () => {
            const intl = getIntl();

            expect(intl.locale).toEqual(DefaultLocale);
        });

        it("should return specific locale from supported list of localizations", () => {
            const intl = getIntl("de-DE");
            expect(intl.locale).toEqual("de-DE");
        });

        it("should return default locale when locale is null", () => {
            // @ts-expect-error Testing possible inputs not allowed by types but possible if used from JavaScript
            const intl = getIntl(null);
            expect(intl.locale).toEqual(DefaultLocale);
        });

        it("should return default locale when locale is undefined", () => {
            const intl = getIntl(undefined);
            expect(intl.locale).toEqual(DefaultLocale);
        });
    });

    describe("getTranslation", () => {
        describe("Messages in supported localizations", () => {
            const localizations: ILocale[] = [
                "en-US",
                "de-DE",
                "es-ES",
                "fr-FR",
                "ja-JP",
                "nl-NL",
                "pt-BR",
                "pt-PT",
                "zh-Hans",
                "ru-RU",
                "it-IT",
                "es-419",
                "fr-CA",
                "en-GB",
                "en-AU",
                "fi-FI",
                "zh-Hant",
                "zh-HK",
                "tr-TR",
                "pl-PL",
                "ko-KR",
                "sl-SI",
            ];

            it("should return message for simple translation key", () => {
                localizations.forEach((locale) => {
                    const result = getTranslation("gs.list.all", locale);
                    expect(result).toBeTruthy();
                });
            });

            it("should return message with replaced placeholders for values", () => {
                localizations.forEach((locale) => {
                    const result = getTranslation("visualizations.of", locale, {
                        page: 1,
                        pagesCount: 5,
                    });
                    expect(result).toBeTruthy();
                    expect(result.includes("{")).toEqual(false);
                });
            });
        });

        it("should return default message in production environment when translationId was not found", () => {
            process.env["NODE_ENV"] = "production";

            const result = getTranslation("unknown_id", "fr-FR");
            expect(result).toEqual("unknown_id");

            process.env["NODE_ENV"] = "test";
        });
    });
});
