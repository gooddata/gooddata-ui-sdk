// (C) 2007-2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import {
    type AccessGranularPermission,
    type EmptyValues,
    type IAttributeFilterConfigs,
    type IInsightLayerDefinition,
    type IInsightParameterValue,
    type ILowerBoundedFilter,
    type IUpperBoundedFilter,
    type MatchFilterOperator as MatchFilterOperatorSdkModel,
} from "@gooddata/sdk-model";

export type Email = string;

export type BooleanAsString = "1" | "0";

export type Timestamp = string;

export type Uri = string;

export interface IAccountSetting {
    login?: Email | null;
    email?: Email | null;
    licence?: BooleanAsString;
    firstName: string;
    lastName: string;
    companyName?: string | null;
    position?: string | null;
    created?: Timestamp;
    updated?: Timestamp;
    timezone?: number | null;
    country?: string | null;
    phoneNumber?: string | null;
    old_password?: string;
    password?: string;
    verifyPassword?: string;
    authenticationModes?: Array<"SSO" | "PASSWORD">;
    ssoProvider?: string | null;
    language?: string;
    ipWhitelist?: string[] | null;
    effectiveIpWhitelist?: string[] | null;
    links?: {
        projects?: Uri;
        self?: Uri;
        domain?: Uri;
        auditEvents?: Uri;
    };
    formatLocale?: string;
}

export interface ISeparators {
    decimal: string;
    thousand: string;
}

export interface IProfileSetting {
    currentProjectUri: Uri | null;
    releaseNotice: string[];
    hints: {
        [key: string]: boolean;
    };
    navigationState?: "collapsed" | "pinned" | "floating";
    projectSettings: {
        [projectUri: string]: {
            dashboard: Uri | null;
            tab: string | null;
            recentSearches: string[];
            introDisplayed?: boolean;
            manageReportsSettings?: {
                folder?: string;
                orderBy?: number;
                tags?: string[];
            };
        };
    };
    npsLastParticipation?: Timestamp;
    separators?: ISeparators;
    defaults?: {
        projectUri: string;
        dashboardUri?: string;
        tabId?: string;
        links?: {
            self: Uri;
        };
    };
    links?: {
        self: Uri;
        profile: Uri;
    };
}

export interface IUISettings {
    // Optional: in pluggable mode the host owns the browser tab title and its brand segment, so the
    // pluggable bootstrap does not supply applicationTitle. Standalone still sets it.
    applicationTitle?: string;
    faviconUrl?: Uri | null;
    organizationName: string;
    displayFlashNews: boolean;
    logoUrl: Uri;
    displayProjects: boolean;
    displayAccountPage: boolean;
    isBranded: boolean;
    supportEmail?: string;
    supportForumUrl?: string;
    privacyPolicyUrl?: Uri;
    documentationUrl?: string;
    securityStatementUrl?: Uri;
    termsOfUseUrl?: Uri;
    trustUrl?: Uri;
    appleTouchIconUrl?: Uri;
    applicationBackgroundColor?: string;
    applicationBackgroundUrl?: Uri;
    skipClientRedirect?: boolean;
    hideRegistration?: boolean;
    largeLogoUrl?: Uri;
    brandColor?: string;
    headerColor?: string;
    activeColor?: string;
    highlightColor?: string;
    headerTextColor?: string;
    useOnboarding?: boolean;
    displayNPS?: boolean;
    ssoLogoutUrl?: Uri;
    ssoExpiredUrl?: Uri;
    ssoUnauthorizedUrl?: Uri;
    showSSOCustomUnauthorizedLoginPage?: boolean;
    showServiceProviderInitiatedLogin?: boolean;
}

export type ObjectCategory =
    | "analyticalDashboard"
    | "attribute"
    | "attributeDisplayForm"
    | "column"
    | "dashboardPlugin"
    | "dataLoadingColumn"
    | "dataSet"
    | "dateFilterConfig"
    | "dimension"
    | "domain"
    | "elementMasking"
    | "etlFile"
    | "executionContext"
    | "fact"
    | "filterContext"
    | "filter"
    | "folder"
    | "kpi"
    | "kpiAlert"
    | "metric"
    | "projectDashboard"
    | "prompt"
    | "reportDefinition"
    | "report"
    | "scheduledMail"
    | "tableDataload"
    | "table"
    | "userFilter"
    | "visualizationClass"
    | "visualizationObject"
    | "visualizationWidget"
    | "theme"
    | "colorPalette"
    | "attributeHierarchy"
    | "user"
    | "userGroup"
    | "dateHierarchyTemplate"
    | "dateAttributeHierarchy";

export interface IObjectMeta {
    category?: ObjectCategory;
    title: string;
    summary?: string;
    tags?: string[];
    author?: string;
    contributor?: string;
    identifier?: string;
    uri?: string;
    deprecated?: "0" | "1";
    isProduction?: 1 | 0;
    created?: Timestamp;
    updated?: Timestamp;
    flags?: string[];
    locked?: boolean;
    permissions?: AccessGranularPermission[];
    isHidden?: boolean;
    projectTemplate?: string;
    sharedWithSomeone?: 1 | 0;
    unlisted?: 1 | 0;
}

export interface IProject {
    meta: IObjectMeta;
    content: {
        guidedNavigation: BooleanAsString;
        authorizationToken?: string | null;
        state?:
            | "PREPARING"
            | "PREPARED"
            | "LOADING"
            | "ENABLED"
            | "DISABLED"
            | "DELETED"
            | "ARCHIVED"
            | "MIGRATED";
        isPublic?: BooleanAsString;
        cluster?: string;
        driver?: "mysql" | "Pg" | "vertica";
        environment?: "PRODUCTION" | "DEVELOPMENT" | "TESTING";
    };
    links?: {
        self: Uri;
        users: Uri;
        userRoles?: Uri;
        userPermissions?: Uri;
        roles: Uri;
        invitations: Uri;
        ldm: Uri;
        ldm_thumbnail: Uri;
        metadata: Uri;
        publicartifacts: Uri;
        uploads?: Uri;
        templates: Uri;
        connectors: Uri;
        dataload: Uri;
        schedules: Uri;
        execute: Uri;
        clearCaches: Uri;
        projectFeatureFlags: Uri;
        config?: Uri;
    };
}

export interface IProjectLcm {
    clientId?: string;
    dataProductId?: string;
    segmentId?: string;
}

export interface IFeatureFlags {
    [key: string]: number | boolean | string;
}

export type ProjectPermission =
    | "canAccessIntegration"
    | "canAccessWorkbench"
    | "canAssignUserWithRole"
    | "canCreateAnalyticalDashboard"
    | "canCreateAttribute"
    | "canCreateAttributeGroup"
    | "canCreateAttributeLabel"
    | "canCreateColumn"
    | "canCreateComment"
    | "canCreateDataSet"
    | "canCreateDomain"
    | "canCreateETLFile"
    | "canCreateExecutionContext"
    | "canCreateFact"
    | "canCreateFilterSettings"
    | "canCreateFolder"
    | "canCreateHelp"
    | "canCreateMetric"
    | "canCreateProjectDashboard"
    | "canCreateProjectTemplates"
    | "canCreatePrompt"
    | "canCreateReport"
    | "canCreateReportDefinition"
    | "canCreateRole"
    | "canCreateScheduledMail"
    | "canCreateTable"
    | "canCreateTableDataLoad"
    | "canAnalyzeWorkspace"
    | "canCreateVisualization"
    | "canCreateVisualizationClass"
    | "canEnrichData"
    | "canExecute"
    | "canExecuteRaw"
    | "canExportDashboard"
    | "canExportReport"
    | "canInitData"
    | "canInviteUserToProject"
    | "canListInvitationsInProject"
    | "canListUsersInProject"
    | "canMaintainProject"
    | "canMaintainUserFilter"
    | "canMaintainUserFilterRelation"
    | "canManageACL"
    | "canManageAnalyticalDashboard"
    | "canManageAttribute"
    | "canManageAttributeGroup"
    | "canManageAttributeLabel"
    | "canManageColumn"
    | "canManageComment"
    | "canManageDataSet"
    | "canManageDomain"
    | "canManageETLFile"
    | "canManageExecutionContext"
    | "canManageFact"
    | "canManageFilterSettings"
    | "canManageFolder"
    | "canManageHelp"
    | "canManageIntegration"
    | "canManageIsProduction"
    | "canManageMetric"
    | "canManageProject"
    | "canManageProjectDashboard"
    | "canManagePrompt"
    | "canManagePublicAccessCode"
    | "canManageReport"
    | "canManageReportDefinition"
    | "canManageScheduledMail"
    | "canManageTable"
    | "canManageTableDataLoad"
    | "canManageTranslations"
    | "canManageVisualization"
    | "canRefreshData"
    | "canSeeOtherUserDetails"
    | "canSeePublicAccessCode"
    | "canSetLocale"
    | "canSetProjectVariables"
    | "canSetStyle"
    | "canSetUserVariables"
    | "canSuspendUserFromProject"
    | "canUploadNonProductionCSV"
    | "canValidateProject";

export interface IProjectPermissions {
    permissions: {
        [permission in ProjectPermission]?: BooleanAsString;
    };
    links?: {
        project: Uri;
        user: Uri;
    };
}

export interface ITemplateInfo {
    version: string;
    url: Uri | null;
    urn: string;
    connectorId?: string;
    createIntegration?: string;
}

export interface IProjectIcons {
    icon: string;
    integration: Uri;
}

export type DataUploadStatus = "PREPARED" | "RUNNING" | "OK" | "ERROR" | "WARNING";

export interface IDataUploadInfo {
    statusesCount: {
        [status in DataUploadStatus]?: number;
    };
}

export interface IIntegration {
    projectTemplate: Uri;
    active: boolean;
}

export interface IStatus {
    code:
        | "NEW"
        | "SCHEDULED"
        | "DOWNLOADING"
        | "DOWNLOADED"
        | "TRANSFORMING"
        | "TRANSFORMED"
        | "UPLOADING"
        | "UPLOADED"
        | "SYNCHRONIZED"
        | "ERROR"
        | "USER_ERROR";
    detail: string;
    description: string;
}

export type TimeIso8601 = string;

export interface IProcessBody {
    links: {
        self: Uri;
    };
    status: IStatus;
    started: TimeIso8601;
    finished: TimeIso8601;
}

export interface IZendesk4Integration {
    projectTemplate: Uri;
    active: boolean;
    lastFinishedProcess?: IProcessBody | null;
    lastSuccessfulProcess?: IProcessBody | null;
    runningProcess?: IProcessBody | null;
    links?: {
        self: Uri;
        processes: Uri;
        configuration: Uri;
    };
    ui?: object;
}

export interface IStyleSettingsType {
    chartPalette: Array<{
        guid: string;
        fill: {
            r: number;
            g: number;
            b: number;
        };
    }>;
    chartFont?: {
        family: string;
    };
}

export interface ITimezoneInfo {
    id: string;
    displayName: string;
    shortDisplayName: string;
    currentOffsetMs: number;
}

export type DateString = string;

export interface IBearBootstrap {
    bootstrapResource: {
        accountSetting: IAccountSetting;
        profileSetting: IProfileSetting;
        hostnameBase: string;
        settings?: IUISettings;
        current?: {
            mapboxToken?: string;
            agGridToken?: string;
            project: IProject | null;
            projectLcm?: IProjectLcm;
            featureFlags?: IFeatureFlags;
            projectPermissions: IProjectPermissions | null;
            projectTemplates: ITemplateInfo[] | null;
            projectIcons: IProjectIcons[] | null;
            dataUploadsInfo: IDataUploadInfo | null;
            loginMD5: string | null;
            integrations: Array<IIntegration | IZendesk4Integration>;
            projectStyleSettings?: IStyleSettingsType | null;
            clusterStatus?: "ONLINE" | "OFFLINE";
            requiresRedirect: boolean;
            timezone: ITimezoneInfo | null;
            analyticalDashboards?: Uri[] | null;
            clientSecret?: string;
            user?: {
                passwordExpirationTimestamp?: DateString;
            };
        };
    };
}

export interface IObjUriQualifier {
    uri: string;
}

export type Identifier = string;

export interface IObjIdentifierQualifier {
    identifier: string;
}

export type ObjQualifier = IObjUriQualifier | IObjIdentifierQualifier;

export type MeasureAggregation =
    | "sum"
    | "count"
    | "approximate_count"
    | "avg"
    | "min"
    | "max"
    | "median"
    | "runsum";

export interface IVisualizationObjectRelativeDateFilter {
    relativeDateFilter: {
        dataSet: ObjQualifier;
        granularity: string;
        from?: number;
        to?: number;
        boundedFilter?: IUpperBoundedFilter | ILowerBoundedFilter;
        emptyValueHandling?: EmptyValues;
    };
}

export interface IVisualizationObjectAbsoluteDateFilter {
    absoluteDateFilter: {
        dataSet: ObjQualifier;
        from?: string;
        to?: string;
        emptyValueHandling?: EmptyValues;
    };
}

export interface IVisualizationObjectPositiveAttributeFilter {
    positiveAttributeFilter: {
        localIdentifier?: string;
        displayForm: ObjQualifier;
        in: string[];
    };
}

export interface IVisualizationObjectNegativeAttributeFilter {
    negativeAttributeFilter: {
        localIdentifier?: string;
        displayForm: ObjQualifier;
        notIn: string[];
    };
}

export type MatchFilterOperator = MatchFilterOperatorSdkModel;

export interface IVisualizationObjectArbitraryAttributeFilter {
    arbitraryAttributeFilter: {
        localIdentifier?: string;
        displayForm: ObjQualifier;
        values: Array<string | null>;
        negativeSelection: boolean;
    };
}

export interface IVisualizationObjectMatchAttributeFilter {
    matchAttributeFilter: {
        localIdentifier?: string;
        displayForm: ObjQualifier;
        operator: MatchFilterOperator;
        literal: string;
        caseSensitive?: boolean;
        negativeSelection?: boolean;
    };
}

export type VisualizationObjectAttributeFilter =
    | IVisualizationObjectPositiveAttributeFilter
    | IVisualizationObjectNegativeAttributeFilter
    | IVisualizationObjectArbitraryAttributeFilter
    | IVisualizationObjectMatchAttributeFilter;

export type VisualizationObjectDateFilter =
    | IVisualizationObjectRelativeDateFilter
    | IVisualizationObjectAbsoluteDateFilter;

// does not include measure value filter and ranking filter as these are not supported on measure item level
export type VisualizationObjectFilter = VisualizationObjectDateFilter | VisualizationObjectAttributeFilter;

export interface IVisualizationObjectMeasureDefinition {
    measureDefinition: {
        item: ObjQualifier;
        aggregation?: MeasureAggregation;
        filters?: VisualizationObjectFilter[];
        computeRatio?: boolean;
    };
}

export type ArithmeticMeasureOperator = "sum" | "difference" | "multiplication" | "ratio" | "change";

export interface IVisualizationObjectArithmeticMeasureDefinition {
    arithmeticMeasure: {
        measureIdentifiers: Identifier[];
        operator: ArithmeticMeasureOperator;
    };
}

export interface IVisualizationObjectPoPMeasureDefinition {
    popMeasureDefinition: {
        measureIdentifier: Identifier;
        popAttribute: ObjQualifier;
    };
}

export interface IPreviousPeriodDateDataSet {
    dataSet: ObjQualifier;
    periodsAgo: number;
}

export interface IVisualizationObjectPreviousPeriodMeasureDefinition {
    previousPeriodMeasure: {
        measureIdentifier: Identifier;
        dateDataSets: IPreviousPeriodDateDataSet[];
    };
}

export type VisualizationObjectMeasureDefinitionType =
    | IVisualizationObjectMeasureDefinition
    | IVisualizationObjectArithmeticMeasureDefinition
    | IVisualizationObjectPoPMeasureDefinition
    | IVisualizationObjectPreviousPeriodMeasureDefinition;

export interface IMeasureContent {
    localIdentifier: Identifier;
    definition: VisualizationObjectMeasureDefinitionType;
    alias?: string;
    title?: string;
    format?: string;
    /** AD rider: the measure is hidden from key-driver analysis (models/metadata.ts#isKdaDisabled) */
    hiddenFromKda?: boolean;
}

export interface IVisualizationObjectMeasure {
    measure: IMeasureContent;
}

export interface IVisualizationAttributeContent {
    localIdentifier: Identifier;
    displayForm: ObjQualifier;
    alias?: string;
    showAllValues?: boolean;
}

export interface IVisualizationObjectAttribute {
    visualizationAttribute: IVisualizationAttributeContent;
}

export type BucketItem = IVisualizationObjectMeasure | IVisualizationObjectAttribute;

export type TotalType = "sum" | "avg" | "max" | "min" | "nat" | "med";

export interface ITotal {
    type: TotalType;
    measureIdentifier: string;
    attributeIdentifier: string;
    alias?: string;
}

export interface IBucket {
    localIdentifier?: Identifier;
    items: BucketItem[];
    totals?: ITotal[];
}

export type ComparisonConditionOperator =
    | "GREATER_THAN"
    | "GREATER_THAN_OR_EQUAL_TO"
    | "LESS_THAN"
    | "LESS_THAN_OR_EQUAL_TO"
    | "EQUAL_TO"
    | "NOT_EQUAL_TO";

export interface IComparisonCondition {
    comparison: {
        operator: ComparisonConditionOperator;
        value: number;
        treatNullValuesAs?: number;
    };
}

export type RangeConditionOperator = "BETWEEN" | "NOT_BETWEEN";

export interface IRangeCondition {
    range: {
        operator: RangeConditionOperator;
        from: number;
        to: number;
        treatNullValuesAs?: number;
    };
}

export type MeasureValueFilterCondition = IComparisonCondition | IRangeCondition;

export interface ILocalIdentifierQualifier {
    localIdentifier: string;
}

export interface IVisualizationObjectMeasureValueFilter {
    measureValueFilter: {
        measure: ObjQualifier | ILocalIdentifierQualifier;
        condition?: MeasureValueFilterCondition;
        conditions?: MeasureValueFilterCondition[];
        dimensionality?: Array<ObjQualifier | ILocalIdentifierQualifier>;
        applyOnResult?: boolean;
    };
}

export type RankingFilterOperator = "TOP" | "BOTTOM";

export interface IVisualizationObjectRankingFilter {
    rankingFilter: {
        // ObjQualifier (uri/identifier) is allowed in addition to a local identifier qualifier so the
        // ranked measure can reference a catalog metric by ref (improved ranking filter), mirroring the
        // measure value filter.
        measures: (ObjQualifier | ILocalIdentifierQualifier)[];
        // ObjQualifier (uri/identifier) is allowed in addition to a local identifier qualifier so the
        // ranking can rank "out of" catalog attributes referenced by ref (improved ranking filter),
        // mirroring the measure value filter dimensionality.
        attributes?: (ObjQualifier | ILocalIdentifierQualifier)[];
        operator: RankingFilterOperator;
        value: number;
        applyOnResult?: boolean;
        strictLimitOfRows?: boolean;
    };
}

export type VisualizationObjectExtendedFilter =
    | VisualizationObjectFilter
    | IVisualizationObjectMeasureValueFilter
    | IVisualizationObjectRankingFilter;

export interface IReferenceItems {
    [identifier: string]: string;
}

export interface IVisualizationObjectContent {
    visualizationClass: IObjUriQualifier;
    buckets: IBucket[];
    filters?: VisualizationObjectExtendedFilter[];
    attributeFilterConfigs?: IAttributeFilterConfigs;
    properties?: string;
    references?: IReferenceItems;
    layers?: IInsightLayerDefinition[];
    /**
     * Per-insight parameter values.
     *
     * @remarks
     * Values equal to the workspace default are not persisted so the insight stays in sync with
     * future default changes. See `parametersToMetadata` / `restoreParameterFilters`.
     */
    parameters?: IInsightParameterValue[];
}

export interface IVisualizationObject {
    meta: IObjectMeta;
    content: IVisualizationObjectContent;
}

export interface IVisualization {
    visualizationObject: IVisualizationObject;
}

export interface IAttributeElementsByRef {
    uris: string[];
}

export interface IAttributeElementsByValue {
    values: string[];
}

export type Qualifier = ObjQualifier | ILocalIdentifierQualifier;

export type AttributeElements = string[] | IAttributeElementsByRef | IAttributeElementsByValue;

export interface IExpressionFilter {
    expression: {
        value: string;
    };
}

export interface IAbsoluteDateFilter {
    absoluteDateFilter: {
        dataSet: ObjQualifier;
        from: string;
        to: string;
    };
}

export interface IRelativeDateFilter {
    relativeDateFilter: {
        dataSet: ObjQualifier;
        granularity: string;
        from: number;
        to: number;
        boundedFilter?: IUpperBoundedFilter | ILowerBoundedFilter;
    };
}

export interface IPositiveAttributeFilter {
    positiveAttributeFilter: {
        displayForm: ObjQualifier;
        in: AttributeElements;
    };
}

export interface INegativeAttributeFilter {
    negativeAttributeFilter: {
        displayForm: ObjQualifier;
        notIn: AttributeElements;
    };
}

export interface IMeasureValueFilter {
    measureValueFilter: {
        measure: Qualifier;
        condition?: MeasureValueFilterCondition;
        dimensionality?: Qualifier[];
        applyOnResult?: boolean;
    };
}

export interface IRankingFilter {
    rankingFilter: {
        measures: Qualifier[];
        attributes?: Qualifier[];
        operator: RankingFilterOperator;
        value: number;
        applyOnResult?: boolean;
        strictLimitOfRows?: boolean;
    };
}

export type DateFilterItem = IAbsoluteDateFilter | IRelativeDateFilter;

export type AttributeFilterItem = IPositiveAttributeFilter | INegativeAttributeFilter;

export type FilterItem = DateFilterItem | AttributeFilterItem;

export type ExtendedFilter = FilterItem | IMeasureValueFilter | IRankingFilter;

export type CompatibilityFilter = IExpressionFilter | ExtendedFilter;

export interface IAttribute {
    localIdentifier: Identifier;
    displayForm: ObjQualifier;
    alias?: string;
}

export interface ISimpleMeasure {
    item: ObjQualifier;
    aggregation?: MeasureAggregation;
    filters?: FilterItem[];
    computeRatio?: boolean;
}

export interface ISimpleMeasureDefinition {
    measure: ISimpleMeasure;
}

export interface IArithmeticMeasure {
    measureIdentifiers: Identifier[];
    operator: ArithmeticMeasureOperator;
}

export interface IArithmeticMeasureDefinition {
    arithmeticMeasure: IArithmeticMeasure;
}

export interface IPopMeasure {
    measureIdentifier: Identifier;
    popAttribute: ObjQualifier;
}

export interface IPopMeasureDefinition {
    popMeasure: IPopMeasure;
}

export interface IPreviousPeriodMeasure {
    measureIdentifier: Identifier;
    dateDataSets: IPreviousPeriodDateDataSet[];
}

export interface IPreviousPeriodMeasureDefinition {
    previousPeriodMeasure: IPreviousPeriodMeasure;
}

export type MeasureDefinition =
    | ISimpleMeasureDefinition
    | IArithmeticMeasureDefinition
    | IPopMeasureDefinition
    | IPreviousPeriodMeasureDefinition;

export interface INativeTotalItem {
    measureIdentifier: Identifier;
    attributeIdentifiers: Identifier[];
}

export interface IMeasure {
    localIdentifier: Identifier;
    definition: MeasureDefinition;
    alias?: string;
    format?: string;
}

export interface IAfm {
    attributes?: IAttribute[];
    measures?: IMeasure[];
    filters?: CompatibilityFilter[];
    nativeTotals?: INativeTotalItem[];
}

export function isObjectUriQualifier(qualifier: ObjQualifier): qualifier is IObjUriQualifier {
    return !isEmpty(qualifier) && (qualifier as IObjUriQualifier).uri !== undefined;
}

export function isLocalIdentifierQualifier(qualifier: unknown): qualifier is ILocalIdentifierQualifier {
    return !isEmpty(qualifier) && (qualifier as ILocalIdentifierQualifier).localIdentifier !== undefined;
}

export function isVisualizationObjectAbsoluteDateFilter(
    filter: VisualizationObjectDateFilter,
): filter is IVisualizationObjectAbsoluteDateFilter {
    return (
        !isEmpty(filter) &&
        (filter as IVisualizationObjectAbsoluteDateFilter).absoluteDateFilter !== undefined
    );
}

export function isVisualizationObjectArithmeticMeasureDefinition(
    definition: VisualizationObjectMeasureDefinitionType,
): definition is IVisualizationObjectArithmeticMeasureDefinition {
    return (
        !isEmpty(definition) &&
        (definition as IVisualizationObjectArithmeticMeasureDefinition).arithmeticMeasure !== undefined
    );
}

export function isVisualizationObjectAttribute(
    bucketItem: IVisualizationObjectMeasure | IVisualizationObjectAttribute,
): bucketItem is IVisualizationObjectAttribute {
    return (
        !isEmpty(bucketItem) &&
        (bucketItem as IVisualizationObjectAttribute).visualizationAttribute !== undefined
    );
}

export function isVisualizationObjectAttributeFilter(
    filter: VisualizationObjectExtendedFilter,
): filter is VisualizationObjectAttributeFilter {
    return (
        !isEmpty(filter) &&
        ((filter as IVisualizationObjectPositiveAttributeFilter).positiveAttributeFilter !== undefined ||
            (filter as IVisualizationObjectNegativeAttributeFilter).negativeAttributeFilter !== undefined ||
            (filter as IVisualizationObjectArbitraryAttributeFilter).arbitraryAttributeFilter !== undefined ||
            (filter as IVisualizationObjectMatchAttributeFilter).matchAttributeFilter !== undefined)
    );
}

export function isVisualizationObjectArbitraryAttributeFilter(
    filter: VisualizationObjectExtendedFilter,
): filter is IVisualizationObjectArbitraryAttributeFilter {
    return (
        !isEmpty(filter) &&
        (filter as IVisualizationObjectArbitraryAttributeFilter).arbitraryAttributeFilter !== undefined
    );
}

export function isVisualizationObjectMatchAttributeFilter(
    filter: VisualizationObjectExtendedFilter,
): filter is IVisualizationObjectMatchAttributeFilter {
    return (
        !isEmpty(filter) &&
        (filter as IVisualizationObjectMatchAttributeFilter).matchAttributeFilter !== undefined
    );
}

export function isVisualizationObjectNegativeAttributeFilter(
    filter: VisualizationObjectExtendedFilter,
): filter is IVisualizationObjectNegativeAttributeFilter {
    return (
        !isEmpty(filter) &&
        (filter as IVisualizationObjectNegativeAttributeFilter).negativeAttributeFilter !== undefined
    );
}

export function isVisualizationObjectDateFilter(
    filter: VisualizationObjectExtendedFilter,
): filter is VisualizationObjectDateFilter {
    return (
        !isEmpty(filter) &&
        ((filter as IVisualizationObjectAbsoluteDateFilter).absoluteDateFilter !== undefined ||
            (filter as IVisualizationObjectRelativeDateFilter).relativeDateFilter !== undefined)
    );
}

export function isVisualizationObjectMeasure(
    bucketItem: IVisualizationObjectMeasure | IVisualizationObjectAttribute,
): bucketItem is IVisualizationObjectMeasure {
    return !isEmpty(bucketItem) && (bucketItem as IVisualizationObjectMeasure).measure !== undefined;
}

export function isVisualizationObjectMeasureValueFilter(
    filter: VisualizationObjectExtendedFilter,
): filter is IVisualizationObjectMeasureValueFilter {
    return (
        !isEmpty(filter) &&
        (filter as IVisualizationObjectMeasureValueFilter).measureValueFilter !== undefined
    );
}

export function isVisualizationObjectPoPMeasureDefinition(
    definition: VisualizationObjectMeasureDefinitionType,
): definition is IVisualizationObjectPoPMeasureDefinition {
    return (
        !isEmpty(definition) &&
        (definition as IVisualizationObjectPoPMeasureDefinition).popMeasureDefinition !== undefined
    );
}

export function isVisualizationObjectPositiveAttributeFilter(
    filter: VisualizationObjectAttributeFilter,
): filter is IVisualizationObjectPositiveAttributeFilter {
    return (
        !isEmpty(filter) &&
        (filter as IVisualizationObjectPositiveAttributeFilter).positiveAttributeFilter !== undefined
    );
}

export function isVisualizationObjectPreviousPeriodMeasureDefinition(
    definition: VisualizationObjectMeasureDefinitionType,
): definition is IVisualizationObjectPreviousPeriodMeasureDefinition {
    return (
        !isEmpty(definition) &&
        (definition as IVisualizationObjectPreviousPeriodMeasureDefinition).previousPeriodMeasure !==
            undefined
    );
}

export function isVisualizationObjectRankingFilter(
    filter: VisualizationObjectExtendedFilter,
): filter is IVisualizationObjectRankingFilter {
    return !isEmpty(filter) && (filter as IVisualizationObjectRankingFilter).rankingFilter !== undefined;
}

export function isVisualizationObjectRelativeDateFilter(
    filter: VisualizationObjectDateFilter,
): filter is IVisualizationObjectRelativeDateFilter {
    return (
        !isEmpty(filter) &&
        (filter as IVisualizationObjectRelativeDateFilter).relativeDateFilter !== undefined
    );
}

export function isVisualization(obj: unknown): obj is IVisualization {
    return !isEmpty(obj) && (obj as IVisualization).visualizationObject !== undefined;
}

export function isAttributeElementsArray(
    attributeElements: AttributeElements,
): attributeElements is string[] {
    return attributeElements !== undefined && attributeElements instanceof Array;
}

export function isAttributeElementsByRef(
    attributeElements: AttributeElements,
): attributeElements is IAttributeElementsByRef {
    return !isEmpty(attributeElements) && (attributeElements as IAttributeElementsByRef).uris !== undefined;
}

export function isAttributeElementsByValue(
    attributeElements: AttributeElements,
): attributeElements is IAttributeElementsByValue {
    return (
        !isEmpty(attributeElements) &&
        !Array.isArray(attributeElements) &&
        (attributeElements as IAttributeElementsByValue).values !== undefined
    );
}

export function isExpressionFilter(filter: CompatibilityFilter): filter is IExpressionFilter {
    return !isEmpty(filter) && (filter as IExpressionFilter).expression !== undefined;
}

export function isPositiveAttributeFilter(filter: CompatibilityFilter): filter is IPositiveAttributeFilter {
    return !isEmpty(filter) && (filter as IPositiveAttributeFilter).positiveAttributeFilter !== undefined;
}

export function isNegativeAttributeFilter(filter: CompatibilityFilter): filter is INegativeAttributeFilter {
    return !isEmpty(filter) && (filter as INegativeAttributeFilter).negativeAttributeFilter !== undefined;
}

export function isRankingFilter(filter: CompatibilityFilter): filter is IRankingFilter {
    return !isEmpty(filter) && (filter as IRankingFilter).rankingFilter !== undefined;
}

export function isSimpleMeasureDefinition(
    definition: MeasureDefinition,
): definition is ISimpleMeasureDefinition {
    return !isEmpty(definition) && (definition as ISimpleMeasureDefinition).measure !== undefined;
}

export interface ITotalItem {
    measureIdentifier: Identifier;
    type: TotalType;
    attributeIdentifier: Identifier;
}

export interface IDimension {
    itemIdentifiers: Identifier[];
    totals?: ITotalItem[];
}

export type SortDirection = "asc" | "desc";

export interface IAttributeLocatorItem {
    attributeLocatorItem: {
        attributeIdentifier: Identifier;
        element: string;
    };
}

export interface IMeasureLocatorItem {
    measureLocatorItem: {
        measureIdentifier: Identifier;
    };
}

export type LocatorItem = IAttributeLocatorItem | IMeasureLocatorItem;

export interface IMeasureSortItem {
    measureSortItem: {
        direction: SortDirection;
        locators: LocatorItem[];
    };
}

export interface IAttributeSortItem {
    attributeSortItem: {
        direction: SortDirection;
        attributeIdentifier: Identifier;
        aggregation?: "sum";
    };
}

export type SortItem = IAttributeSortItem | IMeasureSortItem;

export interface IResultSpec {
    dimensions?: IDimension[];
    sorts?: SortItem[];
}

export interface IExecution {
    execution: {
        afm: IAfm;
        resultSpec?: IResultSpec;
    };
}
