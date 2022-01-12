// (C) 2007-2022 GoodData Corporation

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
    | "ru-RU";

/**
 * Default value for {@link ILocale}.
 *
 * @public
 */
export const DefaultLocale: ILocale = "en-US";
