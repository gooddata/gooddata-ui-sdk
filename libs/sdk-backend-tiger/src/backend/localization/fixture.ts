// (C) 2026 GoodData Corporation

import {
    type ILocalizationDefault,
    type ILocalizationResolvedValue,
    type ILocalizationStatisticsWorkspace,
    type LocalizationSettingType,
} from "@gooddata/sdk-backend-spi";

// Fixture dataset of the localization overview prototype ("Acme"). It stands in for the backend
// localization endpoints until they exist.

export const LOCALIZATION_SETTINGS: LocalizationSettingType[] = ["LOCALE", "METADATA_LOCALE", "DATA_LOCALE"];

export interface IFixtureWorkspace {
    id: string;
    name: string;
    parentId: string | null;
    childrenCount: number;
    settings: Record<LocalizationSettingType, ILocalizationResolvedValue>;
}

export interface IFixturePerson {
    id: string;
    name: string;
    email: string;
    own: Partial<Record<LocalizationSettingType, string>>;
    workspaceIds: string[];
}

interface ILanguageGroup {
    id: string;
    name: string;
    size: number;
    locale: string | null;
    metadataLocale?: { value: string; count: number };
    dataLocale?: { value: string; count: number };
}

const ROOT_ID = "acme";
const ORGANIZATION_LOCALE = "en-US";
const BUILT_IN_METADATA_LOCALE = "en-US";
const PEOPLE_COUNT = 1240;

const GROUPS: ILanguageGroup[] = [
    {
        id: ROOT_ID,
        name: "Acme Retail",
        size: 84,
        locale: null,
        metadataLocale: { value: "cs-CZ", count: 3 },
    },
    {
        id: "dach",
        name: "DACH region",
        size: 42,
        locale: "de-DE",
        metadataLocale: { value: "de-DE", count: 36 },
        dataLocale: { value: "de-DE", count: 2 },
    },
    {
        id: "iberia",
        name: "Iberia",
        size: 25,
        locale: "es-ES",
        metadataLocale: { value: "es-ES", count: 25 },
    },
    { id: "italy", name: "Italy", size: 9, locale: "it-IT" },
    { id: "france", name: "France", size: 9, locale: "fr-FR" },
    { id: "latam", name: "Latin America", size: 6, locale: "es-419" },
    { id: "britain", name: "Great Britain", size: 6, locale: "en-GB" },
    { id: "quebec", name: "Quebec", size: 5, locale: "fr-CA" },
    { id: "zurich", name: "Zurich store", size: 1, locale: "de-CH" },
    { id: "warsaw", name: "Warsaw store", size: 1, locale: "pl-PL" },
];

const OWN_SETTINGS: Array<{ count: number; own: Partial<Record<LocalizationSettingType, string>> }> = [
    { count: 2, own: { LOCALE: "en-US" } },
    { count: 1, own: { LOCALE: "de-DE" } },
    { count: 2, own: { LOCALE: "es-ES" } },
    { count: 3, own: { LOCALE: "ko-KR" } },
    { count: 1, own: { LOCALE: "ja-JP" } },
    { count: 1, own: { LOCALE: "de-CH" } },
    { count: 1, own: { METADATA_LOCALE: "cs-CZ" } },
];

export const FIXTURE_DEFAULTS: Record<LocalizationSettingType, ILocalizationDefault | null> = {
    LOCALE: { content: { value: ORGANIZATION_LOCALE }, source: "ORGANIZATION" },
    METADATA_LOCALE: { content: { value: BUILT_IN_METADATA_LOCALE }, source: "DEFAULT" },
    DATA_LOCALE: null,
};

function groupWorkspaces(group: ILanguageGroup): IFixtureWorkspace[] {
    return Array.from({ length: group.size }, (_, index): IFixtureWorkspace => {
        const isGroupRoot = index === 0;
        const id = isGroupRoot ? group.id : `${group.id}-${String(index).padStart(2, "0")}`;
        const parentId = isGroupRoot ? (group.id === ROOT_ID ? null : ROOT_ID) : group.id;
        const hasMetadataLocale = group.metadataLocale && index >= group.size - group.metadataLocale.count;
        const hasDataLocale = group.dataLocale && index < group.dataLocale.count;

        return {
            id,
            name: isGroupRoot ? group.name : `${group.name} ${index}`,
            parentId,
            childrenCount: isGroupRoot ? group.size - 1 + (group.id === ROOT_ID ? GROUPS.length - 1 : 0) : 0,
            settings: {
                LOCALE: group.locale
                    ? isGroupRoot
                        ? { content: { value: group.locale }, source: "WORKSPACE" }
                        : { content: { value: group.locale }, source: "PARENT", originId: group.id }
                    : { content: { value: ORGANIZATION_LOCALE }, source: "ORGANIZATION" },
                METADATA_LOCALE: hasMetadataLocale
                    ? { content: { value: group.metadataLocale!.value }, source: "WORKSPACE" }
                    : { content: { value: BUILT_IN_METADATA_LOCALE }, source: "DEFAULT" },
                DATA_LOCALE: hasDataLocale
                    ? { content: { value: group.dataLocale!.value }, source: "WORKSPACE" }
                    : { content: { value: null }, source: "DEFAULT" },
            },
        };
    });
}

export function acmeWorkspaces(): IFixtureWorkspace[] {
    return GROUPS.flatMap(groupWorkspaces);
}

export function acmePeople(workspaceIds: string[]): IFixturePerson[] {
    const own = OWN_SETTINGS.flatMap((entry) => Array.from({ length: entry.count }, () => entry.own));
    return Array.from({ length: PEOPLE_COUNT }, (_, index): IFixturePerson => {
        const number = String(index + 1).padStart(4, "0");
        return {
            id: `user-${number}`,
            name: `User ${number}`,
            email: `user-${number}@example.com`,
            own: own[index] ?? {},
            workspaceIds: workspaceIds.length ? [workspaceIds[index % workspaceIds.length]] : [],
        };
    });
}

export function acmeStatisticsWorkspaces(): ILocalizationStatisticsWorkspace[] {
    return [
        {
            id: ROOT_ID,
            name: "Acme Retail",
            parentId: null,
            sourceLanguage: "en-US",
            metadata: {
                total: 1000,
                locales: [
                    { locale: "de-DE", translated: 1000 },
                    { locale: "cs-CZ", translated: 1000 },
                    { locale: "nl-NL", translated: 410 },
                ],
            },
            data: { total: 6, locales: [{ locale: "de-DE", translated: 2 }] },
        },
        {
            id: "dach",
            name: "DACH region",
            parentId: ROOT_ID,
            sourceLanguage: "en-US",
            metadata: { total: 20, locales: [{ locale: "de-DE", translated: 20 }] },
            data: { total: 0, locales: [] },
        },
        {
            id: "italy",
            name: "Italy",
            parentId: ROOT_ID,
            sourceLanguage: "en-US",
            metadata: { total: 120, locales: [{ locale: "it-IT", translated: 120 }] },
            data: { total: 0, locales: [] },
        },
        // Spanish names exist in the first 15 Iberia workspaces only, so the last 10 miss them.
        ...Array.from({ length: 15 }, (_, index): ILocalizationStatisticsWorkspace => {
            const id = `iberia-${String(index + 1).padStart(2, "0")}`;
            return {
                id,
                name: `Iberia ${index + 1}`,
                parentId: "iberia",
                sourceLanguage: "en-US",
                metadata: { total: 640, locales: [{ locale: "es-ES", translated: 640 }] },
                data: { total: 0, locales: [] },
            };
        }),
    ];
}
