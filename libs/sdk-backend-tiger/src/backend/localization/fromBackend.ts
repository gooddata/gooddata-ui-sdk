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
    type LocalizationUsageWorkspaces,
    type LocalizationUserValue,
} from "@gooddata/api-client-tiger";
import {
    type ILocalizationDefault,
    type ILocalizationResolvedValue,
    type ILocalizationSettingUsage,
    type ILocalizationStatistics,
    type ILocalizationTranslatedLocale,
    type ILocalizationUsage,
    type ILocalizationUsageCount,
    type ILocalizationUsageUsersPage,
    type ILocalizationUsageWorkspacesPage,
    type ILocalizationValueContent,
    type LocalizationSettingType,
} from "@gooddata/sdk-backend-spi";

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

export function convertLocalizationUsage(usage: LocalizationUsage): ILocalizationUsage {
    return {
        defaults: {
            LOCALE: convertDefault(usage.defaults.LOCALE),
            METADATA_LOCALE: convertDefault(usage.defaults.METADATA_LOCALE),
            DATA_LOCALE: convertDefault(usage.defaults.DATA_LOCALE),
        },
        values: usage.values.map((value) => ({
            content: convertContent(value.content),
            workspaces: convertCount(value.workspaces),
            users: convertCount(value.users),
            bySetting: convertBySetting(value.bySetting, convertSettingUsage),
        })),
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
