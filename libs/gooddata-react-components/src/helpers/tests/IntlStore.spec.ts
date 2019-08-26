// (C) 2007-2018 GoodData Corporation
import IntlStore from "../IntlStore";
import { DEFAULT_LOCALE } from "../../constants/localization";
import { Localization } from "@gooddata/typings";

describe("IntlStore", () => {
    describe("getIntl", () => {
        it("should return intlProvider for default locale (en-US)", () => {
            const intl = IntlStore.getIntl();

            expect(intl.locale).toEqual(DEFAULT_LOCALE);
        });

        it("should return specific locale from supported list of localizations", () => {
            const intl = IntlStore.getIntl("de-DE");
            expect(intl.locale).toEqual("de-DE");
        });

        it("should return default locale when locale is null", () => {
            const intl = IntlStore.getIntl(null);
            expect(intl.locale).toEqual(DEFAULT_LOCALE);
        });

        it("should return default locale when locale is undefined", () => {
            const intl = IntlStore.getIntl(undefined);
            expect(intl.locale).toEqual(DEFAULT_LOCALE);
        });
    });

    describe("getTranslation", () => {
        describe("Messages in supported localizations", () => {
            const localizations: Localization.ILocale[] = [
                "en-US",
                "de-DE",
                "es-ES",
                "fr-FR",
                "ja-JP",
                "nl-NL",
                "pt-BR",
                "pt-PT",
                "zh-Hans",
            ];

            it("should return message in en-US", () => {
                localizations.forEach(locale => {
                    const result = IntlStore.getTranslation("visualizations.more", locale);
                    expect(result).toBeTruthy();
                });
            });

            it("should return message in en-US with replaced placeholders for values", () => {
                localizations.forEach(locale => {
                    const result = IntlStore.getTranslation("gs.list.limitExceeded", locale, {
                        limit: 42,
                    });
                    expect(result).toBeTruthy();
                    expect(result.includes("{")).toEqual(false);
                });
            });
        });

        it("should return default message in production environment when translationId was not found", () => {
            process.env.NODE_ENV = "production";

            const result = IntlStore.getTranslation("unknown_id", "fr-FR");
            expect(result).toEqual("unknown_id");

            process.env.NODE_ENV = "test";
        });
    });
});
