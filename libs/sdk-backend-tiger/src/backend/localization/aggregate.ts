// (C) 2026 GoodData Corporation

import {
    type ILocalizationPageQuery,
    type ILocalizationResolvedValue,
    type ILocalizationStatistics,
    type ILocalizationStatisticsWorkspace,
    type ILocalizationTranslationCount,
    type ILocalizationTranslationUsage,
    type ILocalizationTranslationValueUsage,
    type ILocalizationUsage,
    type ILocalizationUsageCount,
    type ILocalizationUsageListQuery,
    type ILocalizationUsageUser,
    type ILocalizationUsageWorkspace,
    type ILocalizationValueUsage,
    type LocalizationSettingType,
    type LocalizationTranslatedSettingType,
    type LocalizationTranslationState,
    type LocalizationUsageSource,
} from "@gooddata/sdk-backend-spi";

import {
    FIXTURE_DEFAULTS,
    type IFixturePerson,
    type IFixtureWorkspace,
    LOCALIZATION_SETTINGS,
} from "./fixture.js";

const SOURCE_STRENGTH: LocalizationUsageSource[] = [
    "USER",
    "WORKSPACE",
    "PARENT",
    "ORGANIZATION",
    "ENVIRONMENT",
    "DEFAULT",
];
const DEFAULT_PAGE_SIZE = 100;

type ResolvedSettings = Partial<Record<LocalizationSettingType, ILocalizationResolvedValue>>;

interface IUsageSubject {
    settings: ResolvedSettings;
}

export interface IUsageScope {
    workspaces: IFixtureWorkspace[];
    people: Array<IFixturePerson & { settings: ResolvedSettings }>;
    /**
     * Names of workspaces outside `workspaces` that rows refer to as parent or origin.
     */
    workspaceNames?: ReadonlyMap<string, string>;
    /**
     * Languages a workspace has translations to, from the workspace and its ancestors.
     */
    translatedLocales?: (
        workspaceId: string,
        setting: LocalizationTranslatedSettingType,
    ) => ReadonlySet<string>;
}

const TRANSLATED_SETTINGS: LocalizationTranslatedSettingType[] = ["METADATA_LOCALE", "DATA_LOCALE"];
const TRANSLATION_STATES: LocalizationTranslationState[] = ["missing", "available"];

// Workspaces outside the scope still count for the people who can open them.
function translationState(
    scope: IUsageScope,
    settings: ResolvedSettings,
    workspaceIds: string[],
    value: string,
    setting: LocalizationTranslatedSettingType,
): LocalizationTranslationState | undefined {
    const translated = (workspaceId: string) => scope.translatedLocales?.(workspaceId, setting).has(value);
    if (settings[setting]?.content.value === value) {
        return workspaceIds.some((workspaceId) => !translated(workspaceId)) ? "missing" : undefined;
    }
    if (settings.LOCALE?.content.value === value) {
        return workspaceIds.some(translated) ? "available" : undefined;
    }
    return undefined;
}

function isTranslationSetting(
    setting: LocalizationSettingType | undefined,
): setting is LocalizationTranslatedSettingType {
    return setting === "METADATA_LOCALE" || setting === "DATA_LOCALE";
}

function matchesTranslation(
    scope: IUsageScope,
    settings: ResolvedSettings,
    workspaceIds: string[],
    query: ILocalizationUsageListQuery,
): LocalizationUsageSource | undefined {
    const { value, setting } = query;
    if (value === undefined || !isTranslationSetting(setting)) {
        return undefined;
    }
    return translationState(scope, settings, workspaceIds, value, setting) === query.translation
        ? (settings[setting]?.source ?? "DEFAULT")
        : undefined;
}

export function translationUsage(scope: IUsageScope): ILocalizationTranslationUsage {
    const entries = new Map<string, ILocalizationTranslationValueUsage>();
    const countOf = (
        value: string,
        setting: LocalizationTranslatedSettingType,
        state: LocalizationTranslationState,
    ): ILocalizationTranslationCount => {
        let entry = entries.get(value);
        if (!entry) {
            entry = { content: { value }, bySetting: {} };
            entries.set(value, entry);
        }
        const bySetting = (entry.bySetting[setting] ??= {
            missing: { workspaces: 0, users: 0 },
            available: { workspaces: 0, users: 0 },
        });
        return bySetting[state];
    };
    const subjects = [
        ...scope.workspaces.map((workspace) => ({
            settings: workspace.settings as ResolvedSettings,
            workspaceIds: [workspace.id],
            kind: "workspaces" as const,
        })),
        ...scope.people.map((person) => ({
            settings: person.settings,
            workspaceIds: person.workspaceIds,
            kind: "users" as const,
        })),
    ];

    for (const subject of subjects) {
        const values = new Set(
            [subject.settings.LOCALE, ...TRANSLATED_SETTINGS.map((setting) => subject.settings[setting])]
                .map((setting) => setting?.content.value)
                .filter((value): value is string => !!value),
        );
        for (const value of values) {
            for (const setting of TRANSLATED_SETTINGS) {
                const state = translationState(scope, subject.settings, subject.workspaceIds, value, setting);
                if (state) {
                    countOf(value, setting, state)[subject.kind] += 1;
                }
            }
        }
    }

    for (const entry of entries.values()) {
        for (const setting of TRANSLATED_SETTINGS) {
            const counts = entry.bySetting[setting];
            if (
                counts &&
                TRANSLATION_STATES.every((state) => counts[state].workspaces + counts[state].users === 0)
            ) {
                delete entry.bySetting[setting];
            }
        }
    }
    return { values: [...entries.values()] };
}

export function translatedLocalesOf(
    workspaces: IFixtureWorkspace[],
    statistics: ILocalizationStatisticsWorkspace[],
): (workspaceId: string, setting: LocalizationTranslatedSettingType) => ReadonlySet<string> {
    const parents = new Map(workspaces.map((workspace) => [workspace.id, workspace.parentId]));
    const rows = new Map(statistics.map((row) => [row.id, row]));
    return (workspaceId, setting) => {
        const kind = setting === "METADATA_LOCALE" ? "metadata" : "data";
        const locales = new Set<string>();
        for (let id: string | null | undefined = workspaceId; id; id = parents.get(id)) {
            const row = rows.get(id);
            row?.[kind].locales
                .filter((locale) => locale.translated > 0)
                .forEach((locale) => locales.add(locale.locale));
            // Content written in the source language needs no translation to it.
            if (row?.sourceLanguage && row[kind].total > 0) {
                locales.add(row.sourceLanguage);
            }
        }
        return locales;
    };
}

function strongest(sources: LocalizationUsageSource[]): LocalizationUsageSource {
    return SOURCE_STRENGTH.find((source) => sources.includes(source)) ?? "DEFAULT";
}

function emptyCount(): ILocalizationUsageCount {
    return { total: 0, bySource: {} };
}

function addTo(count: ILocalizationUsageCount, source: LocalizationUsageSource | undefined) {
    count.total += 1;
    if (source) {
        count.bySource[source] = (count.bySource[source] ?? 0) + 1;
    }
}

// Groups the settings of one workspace or person by value; each value keeps its strongest source.
function valuesOf(subject: IUsageSubject): Map<string | null, LocalizationUsageSource> {
    const byValue = new Map<string | null, LocalizationUsageSource[]>();
    for (const type of LOCALIZATION_SETTINGS) {
        const setting = subject.settings[type];
        if (setting?.content.value) {
            byValue.set(setting.content.value, [
                ...(byValue.get(setting.content.value) ?? []),
                setting.source,
            ]);
        }
    }
    return new Map([...byValue].map(([value, sources]) => [value, strongest(sources)]));
}

export function summarize(scope: IUsageScope, peopleWithoutValue: "own" | "effective"): ILocalizationUsage {
    const entries = new Map<string | null, ILocalizationValueUsage>();
    const entry = (value: string | null) => {
        const existing = entries.get(value);
        if (existing) {
            return existing;
        }
        const created: ILocalizationValueUsage = {
            content: { value },
            workspaces: emptyCount(),
            users: emptyCount(),
            bySetting: {},
        };
        entries.set(value, created);
        return created;
    };
    const settingCount = (value: string | null, type: LocalizationSettingType) => {
        const target = entry(value);
        return (target.bySetting[type] ??= { workspaces: emptyCount(), users: emptyCount() });
    };

    for (const workspace of scope.workspaces) {
        for (const [value, source] of valuesOf(workspace)) {
            addTo(entry(value).workspaces, source);
        }
        for (const type of LOCALIZATION_SETTINGS) {
            const setting = workspace.settings[type];
            addTo(settingCount(setting.content.value, type).workspaces, setting.source);
        }
    }

    for (const person of scope.people) {
        const values = valuesOf(person);
        if (values.size === 0 && peopleWithoutValue === "own") {
            addTo(entry(null).users, undefined);
        }
        for (const [value, source] of values) {
            addTo(entry(value).users, source);
        }
        for (const type of LOCALIZATION_SETTINGS) {
            const setting = person.settings[type];
            if (setting) {
                addTo(settingCount(setting.content.value, type).users, setting.source);
            }
        }
    }

    return { defaults: FIXTURE_DEFAULTS, values: [...entries.values()] };
}

export function matchesName(name: string | undefined, candidates: Array<string | undefined>): boolean {
    const term = name?.toLowerCase();
    return !term || candidates.some((candidate) => candidate?.toLowerCase().includes(term));
}

export function matches(
    settings: ResolvedSettings,
    query: ILocalizationUsageListQuery,
): LocalizationUsageSource | undefined {
    const types = query.setting ? [query.setting] : LOCALIZATION_SETTINGS;
    const sources = types
        .map((type) => settings[type])
        .filter(
            (setting): setting is ILocalizationResolvedValue =>
                !!setting && (query.value === undefined || setting.content.value === query.value),
        )
        .map((setting) => setting.source);
    if (sources.length === 0) {
        return undefined;
    }
    const source = strongest(sources);
    return query.source === undefined || query.source === source ? source : undefined;
}

export function page<T>(items: T[], query: ILocalizationPageQuery): T[] {
    const size = query.size ?? DEFAULT_PAGE_SIZE;
    const start = (query.page ?? 0) * size;
    return items.slice(start, start + size);
}

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);

function withOriginNames(
    settings: ResolvedSettings,
    nameOf: (id: string) => string | undefined,
): ResolvedSettings {
    return Object.fromEntries(
        Object.entries(settings).map(([type, setting]) => [
            type,
            setting.originId ? { ...setting, originName: nameOf(setting.originId) } : setting,
        ]),
    );
}

export function usageWorkspaces(
    scope: IUsageScope,
    query: ILocalizationUsageListQuery,
): { workspaces: ILocalizationUsageWorkspace[]; totalCount: number } {
    const names = new Map([
        ...(scope.workspaceNames ?? []),
        ...scope.workspaces.map((workspace): [string, string] => [workspace.id, workspace.name]),
    ]);
    const nameOf = (id: string) => names.get(id);
    const rows = scope.workspaces
        .map((workspace) => ({
            workspace,
            source: query.translation
                ? matchesTranslation(scope, workspace.settings, [workspace.id], query)
                : matches(workspace.settings, query),
        }))
        .filter(
            (row): row is { workspace: IFixtureWorkspace; source: LocalizationUsageSource } => !!row.source,
        )
        .filter(({ workspace }) => matchesName(query.name, [workspace.name]))
        .map(({ workspace, source }): ILocalizationUsageWorkspace => ({
            id: workspace.id,
            name: workspace.name,
            parentId: workspace.parentId,
            parentName: workspace.parentId ? nameOf(workspace.parentId) : undefined,
            childrenCount: workspace.childrenCount,
            source,
            bySetting: withOriginNames(workspace.settings, nameOf),
        }))
        .sort(byName);
    return { workspaces: page(rows, query), totalCount: rows.length };
}

export function usageUsers(
    scope: IUsageScope,
    query: ILocalizationUsageListQuery,
): { users: ILocalizationUsageUser[]; totalCount: number } {
    const rows = scope.people
        .map((person) => ({
            person,
            source: query.translation
                ? matchesTranslation(scope, person.settings, person.workspaceIds, query)
                : matches(person.settings, query),
        }))
        .filter((row): row is { person: IUsageScope["people"][number]; source: LocalizationUsageSource } =>
            Boolean(row.source),
        )
        .filter(({ person }) => matchesName(query.name, [person.name, person.email, person.id]))
        .map(({ person, source }): ILocalizationUsageUser => ({
            id: person.id,
            name: person.name,
            email: person.email,
            source,
            bySetting: person.settings,
        }))
        .sort((a, b) => (a.name ?? a.id).localeCompare(b.name ?? b.id));
    return { users: page(rows, query), totalCount: rows.length };
}

export function statisticsSummary(rows: ILocalizationStatisticsWorkspace[]): ILocalizationStatistics {
    const locales = (kind: "metadata" | "data") => [
        ...new Set(
            rows.flatMap((row) =>
                row[kind].locales.filter((locale) => locale.translated > 0).map((locale) => locale.locale),
            ),
        ),
    ];
    return {
        metadata: { locales: locales("metadata").map((locale) => ({ locale })) },
        data: { locales: locales("data").map((locale) => ({ locale })) },
    };
}

export function statisticsPage(
    rows: ILocalizationStatisticsWorkspace[],
    query: ILocalizationPageQuery,
): { workspaces: ILocalizationStatisticsWorkspace[]; totalCount: number } {
    return { workspaces: page(rows, query), totalCount: rows.length };
}

export function ownSettings(person: IFixturePerson): ResolvedSettings {
    return Object.fromEntries(
        Object.entries(person.own).map(([type, value]) => [type, { content: { value }, source: "USER" }]),
    );
}

export function effectiveSettings(person: IFixturePerson, workspace: IFixtureWorkspace): ResolvedSettings {
    return Object.fromEntries(
        LOCALIZATION_SETTINGS.map((type) => {
            const own = person.own[type];
            return [type, own ? { content: { value: own }, source: "USER" } : workspace.settings[type]];
        }),
    );
}
