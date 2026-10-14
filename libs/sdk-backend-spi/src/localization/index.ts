// (C) 2026 GoodData Corporation

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
 * The value a workspace gets when neither it nor its ancestors set one.
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
     * Defaults per setting. `null` when the setting has no default.
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
     * List translation coverage per workspace.
     */
    getStatisticsWorkspaces(query?: ILocalizationPageQuery): Promise<ILocalizationStatisticsWorkspacesPage>;
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
     * List translation coverage of the workspace and its ancestors.
     */
    getStatisticsWorkspaces(query?: ILocalizationPageQuery): Promise<ILocalizationStatisticsWorkspacesPage>;
}
