// (C) 2026 GoodData Corporation

import { type ILocale, isLocale } from "@gooddata/sdk-model";
import { matchesSearchQuery } from "@gooddata/sdk-ui-kit";

interface ILanguageNames {
    /** The name in the language itself, as the list shows it; never translated. */
    nativeName: string;
    /** The English name, so that the language can be found by it too. */
    englishName: string;
}

/**
 * The interface languages in the order the list shows them (ATEAM-25). A region is named only where a language ships
 * in more than one variant.
 *
 * Endonyms on purpose: a language is listed in its own name, whatever the interface language.
 * Browser API translations do not work on "en-US-x-24h" and are different from the provided ones.
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

/**
 * The interface languages, in the order the list shows them.
 */
export const LANGUAGES: ILocale[] = Object.keys(LANGUAGE_NAMES).filter(isLocale);

/**
 * Whether the search query matches the language by its own name, its English name or its code ("korean", "한국어"
 * and "ko-KR" all find 한국어).
 */
export function matchesLanguage(language: ILocale, query: string): boolean {
    const { nativeName, englishName } = LANGUAGE_NAMES[language];

    return [nativeName, englishName, language].some((text) => matchesSearchQuery(text, query));
}
