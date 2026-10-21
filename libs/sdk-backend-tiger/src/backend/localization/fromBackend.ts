// (C) 2026 GoodData Corporation

import {
    type LocalizationContent,
    type LocalizationCount,
    type LocalizationDefault,
    type LocalizationResolvedValue,
    type LocalizationSettingUsage,
    type LocalizationStatistics,
    type LocalizationStatisticsLocale,
    type LocalizationUsage,
    type LocalizationUsageUsers,
    type LocalizationUsageValue,
    type LocalizationUsageWorkspaces,
    type LocalizationUserValue,
    type WorkspaceLocalizationUsage,
} from "@gooddata/api-client-tiger";
import {
    type ILocalizationDefault,
    type ILocalizationResolvedValue,
    type ILocalizationSettingUsage,
    type ILocalizationStatistics,
    type ILocalizationTranslatedLocale,
    type ILocalizationUsage,
    type ILocalizationUsageCount,
    type ILocalizationUsageListQuery,
    type ILocalizationUsageUsersPage,
    type ILocalizationUsageWorkspacesPage,
    type ILocalizationValueContent,
    type ILocalizationValueUsage,
    type LocalizationSettingType,
} from "@gooddata/sdk-backend-spi";

import { matches, matchesName, page } from "./aggregate.js";

const SETTINGS: LocalizationSettingType[] = ["LOCALE", "METADATA_LOCALE", "DATA_LOCALE"];

function convertContent(content: LocalizationContent): ILocalizationValueContent {
    return { value: content.value ?? null };
}

function convertCount(count: LocalizationCount): ILocalizationUsageCount {
    return { total: count.total, bySource: { ...count.bySource } };
}

function convertDefault(value: LocalizationDefault | null | undefined): ILocalizationDefault | null {
    return value ? { content: convertContent(value.content), source: value.source } : null;
}

function convertSettingUsage(usage: LocalizationSettingUsage): ILocalizationSettingUsage {
    return { workspaces: convertCount(usage.workspaces), users: convertCount(usage.users) };
}

function convertResolvedValue(value: LocalizationResolvedValue): ILocalizationResolvedValue {
    return {
        content: convertContent(value.content),
        source: value.source,
        ...(value.originId ? { originId: value.originId } : {}),
    };
}

function convertUserValue(value: LocalizationUserValue): ILocalizationResolvedValue {
    return { content: convertContent(value.content), source: value.source };
}

function convertBySetting<TIn, TOut>(
    bySetting: Partial<Record<LocalizationSettingType, TIn | null>>,
    convert: (value: TIn) => TOut,
): Partial<Record<LocalizationSettingType, TOut>> {
    const result: Partial<Record<LocalizationSettingType, TOut>> = {};
    for (const setting of SETTINGS) {
        const value = bySetting[setting];
        if (value) {
            result[setting] = convert(value);
        }
    }
    return result;
}

function convertUsageValue(value: LocalizationUsageValue): ILocalizationValueUsage {
    return {
        content: convertContent(value.content),
        workspaces: convertCount(value.workspaces),
        users: convertCount(value.users),
        bySetting: convertBySetting(value.bySetting, convertSettingUsage),
    };
}

// A setting without a value has no default, like an organization setting that nothing sets.
function convertWorkspaceSetting(value: LocalizationResolvedValue): ILocalizationDefault | null {
    return value.content.value ? { content: convertContent(value.content), source: value.source } : null;
}

export function convertLocalizationUsage(usage: LocalizationUsage): ILocalizationUsage {
    return {
        defaults: {
            LOCALE: convertDefault(usage.defaults.LOCALE),
            METADATA_LOCALE: convertDefault(usage.defaults.METADATA_LOCALE),
            DATA_LOCALE: convertDefault(usage.defaults.DATA_LOCALE),
        },
        values: usage.values.map(convertUsageValue),
    };
}

// The defaults of a workspace are the values it gets: set on it, inherited, or the organization defaults.
export function convertWorkspaceLocalizationUsage(usage: WorkspaceLocalizationUsage): ILocalizationUsage {
    return {
        defaults: {
            LOCALE: convertWorkspaceSetting(usage.settings.LOCALE),
            METADATA_LOCALE: convertWorkspaceSetting(usage.settings.METADATA_LOCALE),
            DATA_LOCALE: convertWorkspaceSetting(usage.settings.DATA_LOCALE),
        },
        values: usage.values.map(convertUsageValue),
    };
}

export function convertLocalizationUsageWorkspaces(
    page: LocalizationUsageWorkspaces,
): ILocalizationUsageWorkspacesPage {
    return {
        totalCount: page.totalCount,
        workspaces: page.workspaces.map((workspace) => ({
            id: workspace.id,
            name: workspace.name,
            parentId: workspace.parentId ?? null,
            childrenCount: workspace.childrenCount,
            source: workspace.source,
            bySetting: convertBySetting(workspace.bySetting, convertResolvedValue),
        })),
    };
}

export function convertLocalizationUsageUsers(page: LocalizationUsageUsers): ILocalizationUsageUsersPage {
    return {
        totalCount: page.totalCount,
        users: page.users.map((user) => ({
            id: user.id,
            ...(user.name ? { name: user.name } : {}),
            ...(user.email ? { email: user.email } : {}),
            source: user.source,
            bySetting: convertBySetting(user.bySetting, convertUserValue),
        })),
    };
}

function convertTranslatedLocale(locale: LocalizationStatisticsLocale): ILocalizationTranslatedLocale {
    return { locale: locale.locale };
}

export function convertLocalizationStatistics(statistics: LocalizationStatistics): ILocalizationStatistics {
    return {
        metadata: { locales: statistics.metadata.locales.map(convertTranslatedLocale) },
        data: { locales: statistics.data.locales.map(convertTranslatedLocale) },
    };
}

export interface IWorkspaceLocalizationDescriptor {
    id: string;
    name: string;
    parentId: string | null;
    parentName?: string;
    childrenCount: number;
}

// The list of one workspace holds the workspace itself, when the query matches the values it gets.
export function convertWorkspaceLocalizationUsageWorkspaces(
    usage: WorkspaceLocalizationUsage,
    workspace: IWorkspaceLocalizationDescriptor,
    query: ILocalizationUsageListQuery,
    originNames: ReadonlyMap<string, string> = new Map(),
): ILocalizationUsageWorkspacesPage {
    const bySetting = convertBySetting(usage.settings, (value: LocalizationResolvedValue) => {
        const resolved = convertResolvedValue(value);
        const originName = resolved.originId ? originNames.get(resolved.originId) : undefined;
        return originName ? { ...resolved, originName } : resolved;
    });
    const source = matchesName(query.name, [workspace.name]) ? matches(bySetting, query) : undefined;
    if (!source) {
        return { workspaces: [], totalCount: 0 };
    }
    return {
        totalCount: 1,
        workspaces: page([{ ...workspace, source, bySetting }], query),
    };
}

export function originIdsOf(usage: WorkspaceLocalizationUsage): string[] {
    const ids = Object.values(usage.settings).flatMap((value) => (value?.originId ? [value.originId] : []));
    return [...new Set(ids)];
}
