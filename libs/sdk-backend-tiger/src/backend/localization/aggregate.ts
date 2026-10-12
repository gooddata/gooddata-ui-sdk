// (C) 2026 GoodData Corporation

import {
    type ILocalizationPageQuery,
    type ILocalizationResolvedValue,
    type ILocalizationStatistics,
    type ILocalizationStatisticsWorkspace,
    type ILocalizationUsage,
    type ILocalizationUsageCount,
    type ILocalizationUsageListQuery,
    type ILocalizationUsageUser,
    type ILocalizationUsageWorkspace,
    type ILocalizationValueUsage,
    type LocalizationSettingType,
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

function matches(
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

function page<T>(items: T[], query: ILocalizationPageQuery): T[] {
    const size = query.size ?? DEFAULT_PAGE_SIZE;
    const start = (query.page ?? 0) * size;
    return items.slice(start, start + size);
}

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);

export function usageWorkspaces(
    scope: IUsageScope,
    query: ILocalizationUsageListQuery,
): { workspaces: ILocalizationUsageWorkspace[]; totalCount: number } {
    const rows = scope.workspaces
        .map((workspace) => ({ workspace, source: matches(workspace.settings, query) }))
        .filter(
            (row): row is { workspace: IFixtureWorkspace; source: LocalizationUsageSource } => !!row.source,
        )
        .map(({ workspace, source }): ILocalizationUsageWorkspace => ({
            id: workspace.id,
            name: workspace.name,
            parentId: workspace.parentId,
            childrenCount: workspace.childrenCount,
            source,
            bySetting: workspace.settings,
        }))
        .sort(byName);
    return { workspaces: page(rows, query), totalCount: rows.length };
}

export function usageUsers(
    scope: IUsageScope,
    query: ILocalizationUsageListQuery,
): { users: ILocalizationUsageUser[]; totalCount: number } {
    const rows = scope.people
        .map((person) => ({ person, source: matches(person.settings, query) }))
        .filter((row): row is { person: IUsageScope["people"][number]; source: LocalizationUsageSource } =>
            Boolean(row.source),
        )
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
