// (C) 2026 GoodData Corporation

import { type ObjectType } from "@gooddata/sdk-model";

/**
 * Locale setting covered by the localization overview.
 *
 * @alpha
 */
export type LocalizationSettingType = "LOCALE" | "METADATA_LOCALE" | "DATA_LOCALE";

/**
 * Where a locale value comes from.
 *
 * @remarks
 * `PARENT` means the value is inherited from an ancestor workspace; see `originId`.
 *
 * @alpha
 */
export type LocalizationUsageSource =
    | "USER"
    | "WORKSPACE"
    | "PARENT"
    | "ORGANIZATION"
    | "ENVIRONMENT"
    | "DEFAULT";

/**
 * Locale value. A `null` value means no value.
 *
 * @alpha
 */
export interface ILocalizationValueContent {
    value: string | null;
}

/**
 * Default value of a setting, and where it comes from.
 *
 * @remarks
 * At organization level, it is the value a workspace gets when neither it nor its ancestors set one.
 * At workspace level, it is the value the workspace gets: set on it, inherited from a parent, or a default.
 *
 * @alpha
 */
export interface ILocalizationDefault {
    content: ILocalizationValueContent;
    source: LocalizationUsageSource;
}

/**
 * A count, split by the source of the value.
 *
 * @alpha
 */
export interface ILocalizationUsageCount {
    total: number;
    bySource: Partial<Record<LocalizationUsageSource, number>>;
}

/**
 * Workspaces and people that use a value for one setting.
 *
 * @alpha
 */
export interface ILocalizationSettingUsage {
    workspaces: ILocalizationUsageCount;
    users: ILocalizationUsageCount;
}

/**
 * Usage of one language across the three locale settings.
 *
 * @remarks
 * The top-level counts include each workspace and person once, under the strongest source.
 * At organization level, people count only under a value they set themselves.
 *
 * @alpha
 */
export interface ILocalizationValueUsage {
    content: ILocalizationValueContent;
    workspaces: ILocalizationUsageCount;
    users: ILocalizationUsageCount;
    /**
     * The same counts per setting. Settings that nothing uses the value for are left out.
     */
    bySetting: Partial<Record<LocalizationSettingType, ILocalizationSettingUsage>>;
}

/**
 * Language usage summary of the localization overview.
 *
 * @alpha
 */
export interface ILocalizationUsage {
    /**
     * Defaults per setting. `null` when the setting has no value.
     * At workspace level, they are the values the workspace gets; see {@link ILocalizationDefault}.
     */
    defaults: Record<LocalizationSettingType, ILocalizationDefault | null>;
    /**
     * One entry per language.
     */
    values: ILocalizationValueUsage[];
}

/**
 * Paging of the localization lists.
 *
 * @alpha
 */
export interface ILocalizationPageQuery {
    page?: number;
    size?: number;
}

/**
 * Filters of the workspaces and people behind a usage count. All filters are optional.
 *
 * @alpha
 */
export interface ILocalizationUsageListQuery extends ILocalizationPageQuery {
    value?: string;
    setting?: LocalizationSettingType;
    source?: LocalizationUsageSource;
    /**
     * Case-insensitive part of the name to list.
     *
     * @remarks
     * Workspaces match by name. People match by name, email or user ID.
     * The filter applies before paging, so `totalCount` is the filtered count.
     */
    name?: string;
    /**
     * Lists the workspaces behind one localization issue of the language in `value`.
     * `available` selects `METADATA_LANGUAGE_MISMATCH`, and `missing` and `variant` select `METADATA_MISSING_TRANSLATION`.
     * The people behind an issue are not reported, so a people list with this filter is empty.
     *
     * @remarks
     * For a workspace, the list holds that workspace alone and does not check the issue.
     * Ask only for a language that `getIssues()` reported for the workspace.
     */
    translation?: LocalizationTranslationState;
}

/**
 * Resolved value of one setting in a usage list row.
 *
 * @alpha
 */
export interface ILocalizationResolvedValue {
    content: ILocalizationValueContent;
    source: LocalizationUsageSource;
    /**
     * Workspace the value is inherited from. Set only when `source` is `PARENT`.
     */
    originId?: string;
    /**
     * Name of the workspace in `originId`.
     */
    originName?: string;
}

/**
 * One workspace behind a usage count.
 *
 * @alpha
 */
export interface ILocalizationUsageWorkspace {
    id: string;
    name: string;
    parentId: string | null;
    /**
     * Name of the workspace in `parentId`.
     */
    parentName?: string;
    childrenCount: number;
    source: LocalizationUsageSource;
    bySetting: Partial<Record<LocalizationSettingType, ILocalizationResolvedValue>>;
}

/**
 * One page of the workspaces behind a usage count.
 *
 * @alpha
 */
export interface ILocalizationUsageWorkspacesPage {
    workspaces: ILocalizationUsageWorkspace[];
    totalCount: number;
}

/**
 * One person behind a usage count.
 *
 * @alpha
 */
export interface ILocalizationUsageUser {
    id: string;
    name?: string;
    email?: string;
    source: LocalizationUsageSource;
    bySetting: Partial<Record<LocalizationSettingType, ILocalizationResolvedValue>>;
}

/**
 * One page of the people behind a usage count.
 *
 * @alpha
 */
export interface ILocalizationUsageUsersPage {
    users: ILocalizationUsageUser[];
    totalCount: number;
}

/**
 * Locale setting that uses translations.
 *
 * @alpha
 */
export type LocalizationTranslatedSettingType = "METADATA_LOCALE" | "DATA_LOCALE";

/**
 * Which localization issue to list the workspaces behind.
 *
 * @remarks
 * `missing`: the metadata language has no translation under its code, or the display language has none.
 * `available`: the display language has a translation, but the metadata language is not set to it.
 * `variant`: like `missing`, and a translation to another code of the same language exists.
 * The backend reports `missing` and `variant` as one issue, so their lists hold the same workspaces.
 *
 * @alpha
 */
export type LocalizationTranslationState = "missing" | "available" | "variant";

/**
 * Kind of a localization issue.
 *
 * @remarks
 * `METADATA_MISSING_TRANSLATION`: the metadata language has no translation under exactly its code. When the
 * metadata language is the default, the display language is checked instead.
 * `METADATA_LANGUAGE_MISMATCH`: the display language has a translation, but the metadata language is not set to it.
 * `METADATA_UNUSED_TRANSLATION`: a workspace owns a translation that nobody uses.
 * The backend may add types, so handle an unknown type by ignoring it.
 *
 * @alpha
 */
export type LocalizationIssueType =
    | "METADATA_MISSING_TRANSLATION"
    | "METADATA_LANGUAGE_MISMATCH"
    | "METADATA_UNUSED_TRANSLATION";

/**
 * One localization issue in one language.
 *
 * @alpha
 */
export interface ILocalizationIssue {
    type: LocalizationIssueType;
    /**
     * The problem language.
     */
    locale: string;
    /**
     * Number of workspaces with the issue. Present only for the organization; a workspace reports its own issues.
     */
    workspaces?: number;
}

/**
 * Localization issues of the organization or of one workspace.
 *
 * @remarks
 * Sorted by type in the order of {@link LocalizationIssueType}, then by language. Empty when nothing is wrong.
 *
 * @alpha
 */
export interface ILocalizationIssues {
    issues: ILocalizationIssue[];
}

/**
 * A language that has translations.
 *
 * @alpha
 */
export interface ILocalizationTranslatedLocale {
    locale: string;
}

/**
 * Languages with metadata or data-label translations in scope.
 *
 * @alpha
 */
export interface ILocalizationStatistics {
    metadata: { locales: ILocalizationTranslatedLocale[] };
    data: { locales: ILocalizationTranslatedLocale[] };
}

/**
 * Translation coverage of one kind in one workspace.
 *
 * @remarks
 * Metadata counts translatable texts; data counts labels.
 *
 * @alpha
 */
export interface ILocalizationTranslationCoverage {
    total: number;
    locales: Array<ILocalizationTranslatedLocale & { translated: number }>;
}

/**
 * Translation coverage of what one workspace owns.
 *
 * @alpha
 */
export interface ILocalizationStatisticsWorkspace {
    id: string;
    name: string;
    parentId: string | null;
    sourceLanguage: string | null;
    metadata: ILocalizationTranslationCoverage;
    data: ILocalizationTranslationCoverage;
}

/**
 * One page of the translation coverage per workspace.
 *
 * @alpha
 */
export interface ILocalizationStatisticsWorkspacesPage {
    workspaces: ILocalizationStatisticsWorkspace[];
    totalCount: number;
}

/**
 * Kind of translatable text of an object: its title, its description, its tags,
 * or the free-form texts inside it, such as dashboard section and widget titles.
 *
 * @alpha
 */
export type LocalizationTextKind = "title" | "description" | "tags" | "freeForm";

/**
 * Texts of one kind that have no translation.
 *
 * @alpha
 */
export interface ILocalizationMissingText {
    /**
     * Kind of the untranslated texts.
     */
    text: LocalizationTextKind;
    /**
     * Number of untranslated texts of this kind: 1 for a title or a description, one per tag or free-form text.
     */
    count: number;
}

/**
 * An object of a workspace with texts that have no translation into a language.
 *
 * @alpha
 */
export interface ILocalizationMissingObject {
    /**
     * Object type, for example `measure`, `insight` or `analyticalDashboard`. Undefined when the backend object
     * has no matching `ObjectType`.
     */
    type: ObjectType | undefined;
    /**
     * Id of the object, without its type.
     */
    id: string;
    /**
     * Title of the object in the source language, or its id when it has none.
     */
    title: string;
    /**
     * The kinds of texts without a translation, in the order of the object's texts.
     */
    missing: ILocalizationMissingText[];
}

/**
 * Reads how languages and translations are used across the organization.
 *
 * @alpha
 */
export interface IOrganizationLocalizationService {
    /**
     * Summarize language usage across all workspaces and people.
     */
    getUsage(): Promise<ILocalizationUsage>;

    /**
     * List the workspaces behind a usage count, sorted by name.
     */
    getUsageWorkspaces(query?: ILocalizationUsageListQuery): Promise<ILocalizationUsageWorkspacesPage>;

    /**
     * List the people behind a usage count, sorted by name.
     */
    getUsageUsers(query?: ILocalizationUsageListQuery): Promise<ILocalizationUsageUsersPage>;

    /**
     * List the languages with translations in the organization.
     */
    getStatistics(): Promise<ILocalizationStatistics>;

    /**
     * List the localization issues of the organization, with the number of workspaces behind each.
     */
    getIssues(): Promise<ILocalizationIssues>;
}

/**
 * Reads how languages and translations are used in one workspace.
 *
 * @remarks
 * Usage covers the workspace alone. Statistics cover the workspace and its ancestors.
 *
 * @alpha
 */
export interface IWorkspaceLocalizationService {
    /**
     * Summarize language usage in the workspace and among the people with access to it.
     */
    getUsage(): Promise<ILocalizationUsage>;

    /**
     * List the workspaces behind a usage count, sorted by name.
     */
    getUsageWorkspaces(query?: ILocalizationUsageListQuery): Promise<ILocalizationUsageWorkspacesPage>;

    /**
     * List the people behind a usage count, sorted by name.
     */
    getUsageUsers(query?: ILocalizationUsageListQuery): Promise<ILocalizationUsageUsersPage>;

    /**
     * List the languages with translations in the workspace and its ancestors.
     */
    getStatistics(): Promise<ILocalizationStatistics>;

    /**
     * List the localization issues of the workspace.
     */
    getIssues(): Promise<ILocalizationIssues>;

    /**
     * List translation coverage of the workspace and its ancestors.
     */
    getStatisticsWorkspaces(query?: ILocalizationPageQuery): Promise<ILocalizationStatisticsWorkspacesPage>;

    /**
     * List the objects the workspace owns that have texts without a translation into the language.
     *
     * @remarks
     * Covers only the objects of this workspace, not those it inherits. Blank texts, such as an empty description,
     * are not listed. Downloads the workspace's translations, so it needs the right to manage the workspace.
     * Every call is recorded in the audit log as a download of the workspace's translations.
     *
     * The tiger implementation reads the downloaded translations with the DOM parser of the browser. Outside a
     * browser the call rejects with an `UnexpectedError`.
     *
     * @param locale - language of the translation, for example `ja-JP`
     */
    getMissingTranslations(locale: string): Promise<ILocalizationMissingObject[]>;
}
