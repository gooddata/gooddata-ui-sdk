// (C) 2025-2026 GoodData Corporation

import { type Locale } from "date-fns";
import {
    de,
    enAU,
    enGB,
    enUS,
    es,
    fi,
    fr,
    frCA,
    id,
    it,
    ja,
    ko,
    nl,
    pl,
    pt,
    ptBR,
    ru,
    sl,
    th,
    tr,
    uk,
    vi,
    zhCN,
} from "date-fns/locale";

const convertedLocales: Record<string, Locale> = {
    "en-US": enUS,
    "de-DE": de,
    "es-ES": es,
    "fr-FR": fr,
    "ja-JP": ja,
    "nl-NL": nl,
    "pt-BR": ptBR,
    "pt-PT": pt,
    "zh-Hans": zhCN,
    "ru-RU": ru,
    "it-IT": it,
    "es-419": es,
    "en-GB": enGB,
    "fr-CA": frCA,
    "zh-Hant": zhCN,
    "en-AU": enAU,
    "fi-FI": fi,
    "zh-HK": zhCN,
    "tr-TR": tr,
    "pl-PL": pl,
    "ko-KR": ko,
    "sl-SI": sl,
    "id-ID": id,
    "th-TH": th,
    "uk-UA": uk,
    "vi-VN": vi,
};

/**
 * Converts an app locale code (e.g. "fr-FR") to its date-fns Locale object, for locale-aware formatting
 * outside of react-intl (react-intl's own formatDate/formatMessage already handle locale internally).
 * Falls back to "en-US" when no locale is given or the locale isn't in the lookup table.
 * @internal
 */
export const convertLocale = (locale?: string): Locale =>
    convertedLocales[locale ?? "en-US"] ?? convertedLocales["en-US"];
