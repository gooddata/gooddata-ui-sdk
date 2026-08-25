// (C) 2007-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import { getIntl, getTranslation } from "./IntlStore.js";
import { DefaultLocale, type ILocale } from "./Locale.js";
import { DEFAULT_MESSAGES } from "./messagesMap.js";

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

        it("should return default message when translationId was not found", () => {
            // react-intl reports the missing translation through console.error; silence it instead of
            // switching NODE_ENV to "production". Mutating NODE_ENV is a process-wide side effect and,
            // with test isolation disabled, it permanently breaks react/jsx-dev-runtime (which resolves
            // to the empty production shim) for every test file that runs afterwards in the same worker.
            // The spy is restored automatically after the test (restoreMocks).
            vi.spyOn(console, "error").mockImplementation(() => {});

            const result = getTranslation("unknown_id", "fr-FR", {});
            expect(result).toEqual("unknown_id");
        });
    });
});
