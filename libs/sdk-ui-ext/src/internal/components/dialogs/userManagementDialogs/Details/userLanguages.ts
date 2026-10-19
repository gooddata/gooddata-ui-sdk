// (C) 2026 GoodData Corporation

import {
    type ILocalizationStatistics,
    type IUserLocalizationSettings,
    type LocalizationSettingType,
} from "@gooddata/sdk-backend-spi";
import { LOCALES } from "@gooddata/sdk-model";

export const USER_LANGUAGE_SETTINGS: LocalizationSettingType[] = ["LOCALE", "METADATA_LOCALE", "DATA_LOCALE"];

type TranslationKind = "metadata" | "data";

const TRANSLATION_KINDS: Partial<Record<LocalizationSettingType, TranslationKind>> = {
    METADATA_LOCALE: "metadata",
    DATA_LOCALE: "data",
};

export type LanguageNotice = { type: "notSupported" };

const displayNames = new Map<string, Intl.DisplayNames | undefined>();

function displayNamesFor(uiLocale: string): Intl.DisplayNames | undefined {
    if (!displayNames.has(uiLocale)) {
        try {
            displayNames.set(
                uiLocale,
                new Intl.DisplayNames([uiLocale], {
                    type: "language",
                    languageDisplay: "standard",
                    fallback: "none",
                }),
            );
        } catch {
            displayNames.set(uiLocale, undefined);
        }
    }
    return displayNames.get(uiLocale);
}

export function languageName(code: string, uiLocale: string): string {
    try {
        return displayNamesFor(uiLocale)?.of(code.split("-x-")[0]) ?? code;
    } catch {
        return code;
    }
}

export function isInterfaceLanguage(code: string): boolean {
    return LOCALES.some((locale) => locale === code);
}

export function languageOptions(
    setting: LocalizationSettingType,
    current: string | undefined,
    uiLocale: string,
    statistics?: ILocalizationStatistics,
): string[] {
    const kind = TRANSLATION_KINDS[setting];
    const available =
        kind && statistics ? statistics[kind].locales.map(({ locale }) => locale) : [...LOCALES];
    const codes = new Set(current ? [...available, current] : available);
    return [...codes].sort((a, b) =>
        languageName(a, uiLocale).localeCompare(languageName(b, uiLocale), uiLocale),
    );
}

export function languageNotice(
    setting: LocalizationSettingType,
    languages: IUserLocalizationSettings,
): LanguageNotice | undefined {
    const code = languages[setting];
    return setting === "LOCALE" && code && !isInterfaceLanguage(code) ? { type: "notSupported" } : undefined;
}

export function changedLanguageSettings(
    original: IUserLocalizationSettings,
    updated: IUserLocalizationSettings,
): Array<[LocalizationSettingType, string | undefined]> {
    return USER_LANGUAGE_SETTINGS.filter((type) => original[type] !== updated[type]).map((type) => [
        type,
        updated[type],
    ]);
}
