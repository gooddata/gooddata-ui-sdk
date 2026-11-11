// (C) 2026 GoodData Corporation

import {
    type ILocalizationPageQuery,
    type ILocalizationResolvedValue,
    type ILocalizationStatisticsWorkspace,
    type ILocalizationUsageListQuery,
    type LocalizationSettingType,
    type LocalizationUsageSource,
} from "@gooddata/sdk-backend-spi";

const SOURCE_STRENGTH: LocalizationUsageSource[] = [
    "USER",
    "WORKSPACE",
    "PARENT",
    "ORGANIZATION",
    "ENVIRONMENT",
    "DEFAULT",
];
const LOCALIZATION_SETTINGS: LocalizationSettingType[] = ["LOCALE", "METADATA_LOCALE", "DATA_LOCALE"];
const DEFAULT_PAGE_SIZE = 100;

type ResolvedSettings = Partial<Record<LocalizationSettingType, ILocalizationResolvedValue>>;

export function strongest(sources: LocalizationUsageSource[]): LocalizationUsageSource {
    return SOURCE_STRENGTH.find((source) => sources.includes(source)) ?? "DEFAULT";
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

export function statisticsPage(
    rows: ILocalizationStatisticsWorkspace[],
    query: ILocalizationPageQuery,
): { workspaces: ILocalizationStatisticsWorkspace[]; totalCount: number } {
    return { workspaces: page(rows, query), totalCount: rows.length };
}
