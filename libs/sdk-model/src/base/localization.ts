// (C) 2019-2026 GoodData Corporation

/**
 * Language codes that can be used with GoodData.
 *
 * @public
 */
export type ILocale =
    | "en-US"
    | "en-US-x-24h"
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
    | "zh-HK"
    | "tr-TR"
    | "pl-PL"
    | "ko-KR"
    | "sl-SI"
    | "id-ID"
    | "th-TH"
    | "vi-VN"
    | "uk-UA";

/**
 * Array of locales for type-guard. It must be the same as {@link ILocale}
 *
 * @internal
 */
export const LOCALES = [
    "en-US",
    "en-US-x-24h",
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
    "id-ID",
    "th-TH",
    "vi-VN",
    "uk-UA",
] satisfies ILocale[];

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

/**
 * @internal
 */
export interface ILanguageNames {
    nativeName: string;
    englishName: string;
}

/**
 * The interface languages in the order the list shows them (alphabetically by a native name).
 * A region is named only where a language ships in more than one variant.
 *
 * Not translated on purpose: a language is listed in its own name, whatever the interface language.
 * Browser API translations do not work on "en-US-x-24h" and are different from the provided ones.
 *
 * @internal
 */
export const LANGUAGE_NAMES: Record<ILocale, ILanguageNames> = {
    "id-ID": { nativeName: "Bahasa Indonesia", englishName: "Indonesian" },
    "de-DE": { nativeName: "Deutsch", englishName: "German" },
    "en-AU": { nativeName: "English (Australia)", englishName: "English (Australia)" },
    "en-GB": { nativeName: "English (UK)", englishName: "English (UK)" },
    "en-US": { nativeName: "English (US)", englishName: "English (US)" },
    "en-US-x-24h": { nativeName: "English (US, 24-hour)", englishName: "English (US, 24-hour)" },
    "es-ES": { nativeName: "Español (España)", englishName: "Spanish (Spain)" },
    "es-419": { nativeName: "Español (Latinoamérica)", englishName: "Spanish (Latin America)" },
    "fr-CA": { nativeName: "Français (Canada)", englishName: "French (Canada)" },
    "fr-FR": { nativeName: "Français (France)", englishName: "French (France)" },
    "it-IT": { nativeName: "Italiano", englishName: "Italian" },
    "nl-NL": { nativeName: "Nederlands", englishName: "Dutch" },
    "pl-PL": { nativeName: "Polski", englishName: "Polish" },
    "pt-BR": { nativeName: "Português (Brasil)", englishName: "Portuguese (Brazil)" },
    "pt-PT": { nativeName: "Português (Portugal)", englishName: "Portuguese (Portugal)" },
    "sl-SI": { nativeName: "Slovenščina", englishName: "Slovenian" },
    "fi-FI": { nativeName: "Suomi", englishName: "Finnish" },
    "vi-VN": { nativeName: "Tiếng Việt", englishName: "Vietnamese" },
    "tr-TR": { nativeName: "Türkçe", englishName: "Turkish" },
    "ru-RU": { nativeName: "Русский", englishName: "Russian" },
    "uk-UA": { nativeName: "Українська", englishName: "Ukrainian" },
    "th-TH": { nativeName: "ไทย", englishName: "Thai" },
    "zh-HK": { nativeName: "中文 (香港)", englishName: "Chinese (Hong Kong)" },
    "ja-JP": { nativeName: "日本語", englishName: "Japanese" },
    "zh-Hans": { nativeName: "简体中文", englishName: "Chinese (Simplified)" },
    "zh-Hant": { nativeName: "繁體中文", englishName: "Chinese (Traditional)" },
    "ko-KR": { nativeName: "한국어", englishName: "Korean" },
};
