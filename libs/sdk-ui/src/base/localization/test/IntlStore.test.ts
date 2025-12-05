// (C) 2007-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { getIntl, getTranslation } from "../IntlStore.js";
import { DefaultLocale, ILocale } from "../Locale.js";
import { DEFAULT_MESSAGES } from "../messagesMap.js";

describe("IntlStore", () => {
    describe.skip("getIntl", () => {
        it("should return intlProvider for default locale (en-US)", () => {
            const intl = getIntl(DefaultLocale, {});

            expect(intl.locale).toEqual(DefaultLocale);
        });

        it("should return specific locale from supported list of localizations", () => {
            const intl = getIntl("de-DE", {});
            expect(intl.locale).toEqual("de-DE");
        });

        it("should return default locale when locale is undefined", () => {
            const intl = getIntl(undefined, {});
            expect(intl.locale).toEqual(DefaultLocale);
        });
    });

    describe("getTranslation", () => {
        describe("Messages in supported localizations", () => {
            const localizations: ILocale[] = ["en-US"];

            it("should return message for simple translation key", () => {
                localizations.forEach((locale) => {
                    const result = getTranslation("gs.list.all", locale, DEFAULT_MESSAGES["en-US"], {});
                    expect(result).toBeTruthy();
                });
            });

            it("should return message with replaced placeholders for values", () => {
                localizations.forEach((locale) => {
                    const result = getTranslation(
                        "visualizations.of",
                        locale,
                        {
                            "visualizations.of": "of {page} of {pagesCount}",
                        },
                        {
                            page: 1,
                            pagesCount: 5,
                        },
                    );
                    expect(result).toBeTruthy();
                    expect(result.includes("{")).toEqual(false);
                });
            });
        });

        it("should return default message in production environment when translationId was not found", () => {
            process.env["NODE_ENV"] = "production";

            const result = getTranslation("unknown_id", "fr-FR", {});
            expect(result).toEqual("unknown_id");

            process.env["NODE_ENV"] = "test";
        });
    });
});
