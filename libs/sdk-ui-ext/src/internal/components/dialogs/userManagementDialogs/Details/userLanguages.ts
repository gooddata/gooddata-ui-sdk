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

export type LanguageNotice =
    | { type: "notSupported" }
    | { type: "noTranslation" }
    | { type: "noTranslationIn"; count: number }
    | { type: "translationAvailable" };

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

function isEnglish(code: string): boolean {
    return code.split("-")[0].toLowerCase() === "en";
}

function canonicalLocale(code: string): string {
    try {
        return Intl.getCanonicalLocales(code)[0] ?? code;
    } catch {
        return code;
    }
}

function isSameLocale(a: string | undefined, b: string): boolean {
    return a !== undefined && canonicalLocale(a) === canonicalLocale(b);
}

function translatedWorkspaceCount(
    workspaceStatistics: ILocalizationStatistics[],
    kind: TranslationKind,
    code: string,
): number {
    return workspaceStatistics.filter((statistics) =>
        statistics[kind].locales.some(({ locale }) => isSameLocale(locale, code)),
    ).length;
}

export function languageNotice(
    setting: LocalizationSettingType,
    languages: IUserLocalizationSettings,
    workspaceStatistics: ILocalizationStatistics[] = [],
    organizationLanguages: IUserLocalizationSettings = {},
): LanguageNotice | undefined {
    const code = languages[setting];
    const kind = TRANSLATION_KINDS[setting];
    if (!kind) {
        return code && !isInterfaceLanguage(code) ? { type: "notSupported" } : undefined;
    }
    const workspaceCount = workspaceStatistics.length;
    if (workspaceCount === 0) {
        return undefined;
    }
    if (code) {
        if (isEnglish(code)) {
            return undefined;
        }
        const missing = workspaceCount - translatedWorkspaceCount(workspaceStatistics, kind, code);
        if (missing === workspaceCount) {
            return { type: "noTranslation" };
        }
        return missing > 0 ? { type: "noTranslationIn", count: missing } : undefined;
    }
    const interfaceCode = languages.LOCALE;
    if (
        !interfaceCode ||
        isEnglish(interfaceCode) ||
        !isInterfaceLanguage(interfaceCode) ||
        isSameLocale(organizationLanguages[setting], interfaceCode)
    ) {
        return undefined;
    }
    return translatedWorkspaceCount(workspaceStatistics, kind, interfaceCode) > 0
        ? { type: "translationAvailable" }
        : undefined;
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
