// (C) 2007-2024 GoodData Corporation

/**
 * Language codes that can be used with GoodData.
 *
 * @public
 */
export type ILocale =
    | "en-US"
    | "de-DE"
    | "es-ES"
    | "fr-FR"
    | "ja-JP"
    | "nl-NL"
    | "pt-BR"
    | "pt-PT"
    | "zh-Hans"
    | "ru-RU"
    | "it-IT"
    | "es-419"
    | "fr-CA"
    | "en-GB"
    | "en-AU"
    | "fi-FI"
    | "zh-Hant"
    | "zh-HK";

/**
 * Array of locales for type-guard. It must be the same as {@link ILocale}
 *
 * @internal
 */
export const LOCALES = [
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
];

/**
 * Type-guard for language codes that can be used with GoodData.
 *
 * @public
 */
export const isLocale = (locale: unknown): locale is ILocale => {
    return typeof locale === "string" && LOCALES.includes(locale as ILocale);
};

/**
 * Default value for {@link ILocale}.
 *
 * @public
 */
export const DefaultLocale: ILocale = "en-US";
