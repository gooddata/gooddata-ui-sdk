// (C) 2019-2025 GoodData Corporation

import {
    CatalogItem,
    FilterContextItem,
    IDashboard,
    IDashboardAttributeFilterConfig,
    IDashboardBase,
    IDashboardDefinition,
    IDashboardFilterView,
    IDashboardFilterViewSaveRequest,
    IDashboardObjectIdentity,
    IDashboardPermissions,
    IDashboardPlugin,
    IDashboardPluginDefinition,
    IDataSetMetadataObject,
    IDateFilter,
    IExecutionDefinition,
    IExistingDashboard,
    IFilter,
    IFilterContext,
    IFilterContextDefinition,
    IInsight,
    IListedDashboard,
    IScheduledMail,
    IScheduledMailDefinition,
    IWidget,
    IWidgetAlert,
    IWidgetAlertDefinition,
    ObjRef,
    ObjectOrigin,
    ObjectType,
} from "@gooddata/sdk-model";

import { IFilterBaseOptions } from "../../common/filtering.js";
import { IPagedResource } from "../../common/paging.js";
import { IExportResult } from "../execution/export.js";

/**
 * Dashboard referenced objects
 * @alpha
 */
export interface IDashboardReferences {
    /**
     * Referenced insights. Empty if no insights on dashboard or referenced insights were not requested.
     */
    insights: IInsight[];

    /**
     * Referenced plugins. Empty if no plugins on dashboard or referenced plugins were not requested.
     */
    plugins: IDashboardPlugin[];

    /**
     * Referenced dataSets. Only direct references, does not include dataSets linked from filter context.
     */
    dataSets?: IDataSetMetadataObject[];
}

/**
 * Dashboard with referenced objects
 * @alpha
 */
export interface IDashboardWithReferences {
    dashboard: IDashboard;
    references: IDashboardReferences;
}

/**
 * List of currently supported types of references that can be retrieved using getWidgetReferencedObjects()
 * @alpha
 */
export type SupportedWidgetReferenceTypes = Exclude<
    ObjectType,
    | "fact"
    | "attribute"
    | "displayForm"
    | "dataSet"
    | "tag"
    | "insight"
    | "variable"
    | "colorPalette"
    | "attributeHierarchy"
>;

//
/**
 * Contains information about objects that may be referenced by a widget. The contents of this object
 * depend on the widget and the types requested at the time of call to getWidgetReferencedObjects.
 *
 * @alpha
 */
export interface IWidgetReferences {
    /**
     * If requested, measures referenced by the widget will be returned here.
     * If none of them were requested, the catalogItems will be undefined.
     */
    catalogItems?: CatalogItem[];
}

/**
 * Pair of the widget and it's alert count
 * @alpha
 */
export interface IWidgetAlertCount {
    /**
     * Widget reference
     */
    readonly ref: ObjRef;

    /**
     * Number of alerts for the referenced widget
     */
    readonly alertCount: number;
}

/**
 * Configuration options for getting dashboards.
 *
 * @alpha
 */
export interface IGetDashboardOptions {
    /**
     * Specify if information about the users that created/modified the dashboard should be loaded.
     * Defaults to false.
     *
     * If user is inactive or logged in user has not rights to access this information than users that created/modified is undefined.
     */
    loadUserData?: boolean;

    /**
     * Specify if also dashboards available only via link should be loaded.
     * Such dashboards may not be supported by every backend.
     *
     * Defaults to false.
     */
    includeAvailableViaLink?: boolean;

    /**
     * Specify id of the currently performed dashboard pdf export.
     * This id is used to retrieve export-related metadata, such as currently active attribute filters.
     *
     * The id is missing when the dashboard is not loaded in the export mode
     */
    exportId?: string;

    /**
     * Specify type of the currently performed dashboard export.
     * This id is used to retrieve export-related metadata, such as currently active attribute filters.
     */
    exportType?: "visual" | "slides";
}

/**
 * Configuration options for getting dashboard plugin.
 *
 * @alpha
 */
export interface IGetDashboardPluginOptions {
    /**
     * Specify if information about the users that created/modified the dashboard plugin should be loaded.
     * Defaults to false.
     *
     * If user is inactive or logged-in user has not rights to access this information than users that created/modified is undefined.
     */
    loadUserData?: boolean;
}

/**
 * Configuration options for getting scheduled mails.
 *
 * @alpha
 */
export interface IGetScheduledMailOptions {
    /**
     * Specify if information about the users that created/modified the scheduled email should be loaded.
     *
     * @remarks
     * Defaults to false.
     *
     * If user is inactive or logged in user has not rights to access this information than users that created/modified is undefined.
     */
    loadUserData?: boolean;

    /**
     * List only subset of scheduled mails authored by current user.
     *
     * @remarks
     * Defaults to false.
     */
    createdByCurrentUser?: boolean;
}

/**
 * @alpha
 */
export type SupportedDashboardReferenceTypes = "insight" | "dashboardPlugin" | "dataSet";

/**
 * Custom title override for raw exports.
 *
 * @alpha
 */
export interface IRawExportCustomOverride {
    /**
     * Custom title for the object.
     */
    title: string;
}

/**
 * Custom title overrides for raw exports.
 *
 * @alpha
 */
export interface IRawExportCustomOverrides {
    /**
     * Mapping of localId - custom override.
     */
    measures?: Record<string, IRawExportCustomOverride>;

    /**
     * Mapping of localId - custom override.
     */
    displayForms?: Record<string, IRawExportCustomOverride>;
}

/**
 * Options for exporting dashboard to tabular format.
 *
 * @alpha
 */
export interface IDashboardExportTabularOptions {
    /**
     * Title for the export. If not provided, the dashboard title will be fetched.
     */
    title?: string;

    /**
     * Export format. Defaults to "XLSX" if not specified.
     */
    format?: "XLSX" | "PDF";

    /**
     * If true, the headers will be merged into a single row
     */
    mergeHeaders?: boolean;

    /**
     * If true, the export info will be included in the file
     */
    exportInfo?: boolean;

    /**
     * Widgets to export. If not provided, all widgets will be exported.
     */
    widgetIds?: string[];

    /**
     * If true, the dashboard filters will be applied to the exported dashboard
     */
    dashboardFiltersOverride?: FilterContextItem[];

    /**
     * PDF-specific configuration options. Only applicable when format is "PDF".
     */
    pdfConfiguration?: {
        pageSize?: "A3" | "A4" | "LETTER";
        pageOrientation?: "PORTRAIT" | "LANDSCAPE";
        showInfoPage?: boolean;
    };
}

/**
 * Options for exporting dashboard to png format
 *
 * @alpha
 */
export interface IDashboardExportImageOptions {
    /**
     * Widgets to export. If not provided, all widgets will be exported.
     */
    widgetIds?: ObjRef[];

    /**
     * Filename for the export. If not provided, the dashboard title will be fetched.
     */
    filename?: string;
}

/**
 * Options for exporting a dashboard to a presentation.
 *
 * @beta
 */
export interface IDashboardExportPresentationOptions {
    widgetIds?: ObjRef[];
    visualizationIds?: ObjRef[];
    templateId?: string;
    title?: string;
    hideWidgetTitles?: boolean;
    filename?: string;
}

/**
 * Service to list, create and update analytical dashboards
 *
 * @alpha
 */
export interface IWorkspaceDashboardsService {
    readonly workspace: string;

    /**
     * Gets all dashboards available in current workspace.
     *
     * @param options - Specify additional options
     * @returns promise of list of the dashboards
     */
    getDashboards(options?: IGetDashboardOptions): Promise<IListedDashboard[]>;

    /**
     * List dashboards
     *
     * @returns methods for querying dashboards
     */
    getDashboardsQuery(): IDashboardsQuery;

    /**
     * Load dashboard by its reference,
     * and override filter context with the given custom filter context
     * (custom filter context is used mainly for exporting)
     *
     * @param ref - dashboard ref
     * @param filterContextRef - Override dashboard filter context with the custom filter context
     * (This allows to modify filter context when exporting the dashboard)
     * @param options - Specify additional options
     * @returns promise of the dashboard
     */
    getDashboard(ref: ObjRef, filterContextRef?: ObjRef, options?: IGetDashboardOptions): Promise<IDashboard>;

    /**
     * Loads a dashboard and objects that the dashboard references.
     *
     * @param ref - dashboard ref
     * @param filterContextRef - Override dashboard filter context with the custom filter context
     * (This allows to modify filter context when exporting the dashboard)
     * @param options - Specify additional options
     * @param types - types of dashboard references to load; if the types are undefined, the service
     *  must default to loading insights related to the dashboard
     * @returns promise of the dashboard and references
     */
    getDashboardWithReferences(
        ref: ObjRef,
        filterContextRef?: ObjRef,
        options?: IGetDashboardOptions,
        types?: SupportedDashboardReferenceTypes[],
    ): Promise<IDashboardWithReferences>;

    /**
     * Get objects referenced by a given dashboard.
     *
     * @param dashboard - dashboard to get referenced objects for
     * @param types - optional array of object types to include, when not specified, all supported references will
     *  be retrieved
     */
    getDashboardReferencedObjects(
        dashboard: IDashboard,
        types?: SupportedDashboardReferenceTypes[],
    ): Promise<IDashboardReferences>;

    /**
     * Get filter context by provided export id and type
     *
     * @param exportId - export id
     * @param type - export type
     */
    getFilterContextByExportId(
        exportId: string,
        type: "visual" | "slides" | undefined,
    ): Promise<{ filterContext?: IFilterContext; title?: string; hideWidgetTitles?: boolean } | null>;

    /**
     * Create and save dashboard for the provided dashboard definition
     *
     * @param dashboard - dashboard definition
     * @returns promise of the created dashboard
     */
    createDashboard(dashboard: IDashboardDefinition): Promise<IDashboard>;

    /**
     * Update dashboard
     *
     * @param dashboard - original dashboard before modifications
     * @param updatedDashboard - modified dashboard
     * @returns promise of the updated dashboard
     */
    updateDashboard(dashboard: IDashboard, updatedDashboard: IDashboardDefinition): Promise<IDashboard>;

    /**
     * Patch dashboard
     *
     * @param updatedDashboard - modified dashboard
     * @returns promise of the updated dashboard
     */
    updateDashboardMeta(
        updatedDashboard: IDashboardObjectIdentity & Partial<IDashboardBase>,
    ): Promise<IDashboard>;

    /**
     * Delete dashboard
     *
     * @param ref - dashboard reference
     * @returns promise
     */
    deleteDashboard(ref: ObjRef): Promise<void>;

    /**
     * Export dashboard to pdf. You can override dashboard filters with custom filters.
     * When no custom filters are set, the persisted dashboard filters will be used.
     *
     * PDF file is downloaded and attached as Blob data to the current window instance.
     *
     * @param ref - dashboard reference
     * @param filters - Override stored dashboard filters with custom filters
     * @returns promise with object URL pointing to a Blob data of downloaded exported dashboard
     */
    exportDashboardToPdf(ref: ObjRef, filters?: FilterContextItem[]): Promise<IExportResult>;

    /**
     * Export dashboard to pdf. You can override dashboard filters with custom filters.
     * When no custom filters are set, the persisted dashboard filters will be used.
     *
     * PDF file is downloaded and attached as Blob data to the current window instance.
     *
     * @param ref - dashboard reference
     * @param format - export format
     * @param filters - Override stored dashboard filters with custom filters
     * @param options - additional options
     * @returns promise with object URL pointing to a Blob data of downloaded exported dashboard
     */
    exportDashboardToPresentation(
        ref: ObjRef,
        format: "PDF" | "PPTX",
        filters?: FilterContextItem[],
        options?: IDashboardExportPresentationOptions,
    ): Promise<IExportResult>;

    /**
     * Export dashboard to png.
     *
     * PNG file is downloaded and attached as Blob data to the current window instance.
     * If title is not provided, the dashboard title will be fetched.
     *
     * @param ref - dashboard reference
     * @param filters - Override stored dashboard filters with custom filters
     * @param options - export options
     * @returns promise with object URL pointing to a Blob data of downloaded exported dashboard
     */

    exportDashboardToImage(
        ref: ObjRef,
        filters?: FilterContextItem[],
        options?: IDashboardExportImageOptions,
    ): Promise<IExportResult>;

    /**
     * Export dashboard to tabular.
     *
     * Tabular file is downloaded and attached as Blob data to the current window instance.
     * If title is not provided, the dashboard title will be fetched.
     *
     * @param ref - dashboard reference
     * @param options - export options
     * @returns promise with object URL pointing to a Blob data of downloaded exported dashboard
     */
    exportDashboardToTabular(ref: ObjRef, options?: IDashboardExportTabularOptions): Promise<IExportResult>;

    /**
     * Export dashboard to CSV raw.
     *
     * CSV raw file is downloaded and attached as Blob data to the current window instance.
     *
     * @param definition - execution definition
     * @param fileName - name of the file
     * @param customOverrides - custom title overrides for measures and display forms
     * @returns promise with object URL pointing to a Blob data of downloaded exported dashboard
     */
    exportDashboardToCSVRaw(
        definition: IExecutionDefinition,
        fileName: string,
        customOverrides?: IRawExportCustomOverrides,
    ): Promise<IExportResult>;

    /**
     * Create scheduled mail for the dashboard
     *
     * @param scheduledMail - scheduled email definition
     * @param exportFilterContext - override dashboard filter context with the custom filter context during the export
     * @returns promise of the created scheduled email
     */
    createScheduledMail(
        scheduledMail: IScheduledMailDefinition,
        exportFilterContext?: IFilterContextDefinition,
    ): Promise<IScheduledMail>;

    /**
     * Update existing scheduled mail for the dashboard
     *
     * @param ref - reference to the existing scheduled email object
     * @param scheduledMail - scheduled email definition
     * @param filterContextRef - optional reference to an existing filter context to be used in all attachments
     * @returns promise of the updated scheduled email
     */
    updateScheduledMail(
        ref: ObjRef,
        scheduledMail: IScheduledMailDefinition,
        filterContextRef?: ObjRef,
    ): Promise<void>;

    /**
     * Delete scheduled mail
     *
     * @param ref - scheduled email reference
     * @returns promise
     */
    deleteScheduledMail(ref: ObjRef): Promise<void>;

    /**
     * Get scheduled emails for particular dashboard
     *
     * @param ref - dashboard reference
     * @param options - specify additional options
     * @returns promise with scheduled emails connected to the dashboard
     */
    getScheduledMailsForDashboard(ref: ObjRef, options?: IGetScheduledMailOptions): Promise<IScheduledMail[]>;

    /**
     * Get the number of scheduled emails for particular dashboard
     *
     * @param ref - dashboard reference
     * @returns promise with the number of scheduled emails connected to the dashboard
     */
    getScheduledMailsCountForDashboard(ref: ObjRef): Promise<number>;

    /**
     * Get all widget alerts for the current user
     *
     * @returns promise with all user widget alerts
     */
    getAllWidgetAlertsForCurrentUser(): Promise<IWidgetAlert[]>;

    /**
     * Get all widget alerts for the current user for the given dashboard
     *
     * @param ref - dashboard reference
     * @returns promise with all user widget alerts for the dashboard
     */
    getDashboardWidgetAlertsForCurrentUser(ref: ObjRef): Promise<IWidgetAlert[]>;

    /**
     * Get the number of widget alerts (created by any user) for particular widgets
     *
     * @param refs - widget references
     * @returns promise with array of pairs of widget ref and alert count
     */
    getWidgetAlertsCountForWidgets(refs: ObjRef[]): Promise<IWidgetAlertCount[]>;

    /**
     * Create widget alert for the provided widget alert definition
     *
     * @param alert - widget alert definition
     * @returns promise with the created alert
     */
    createWidgetAlert(alert: IWidgetAlertDefinition): Promise<IWidgetAlert>;

    /**
     * Update widget alert
     *
     * @param alert - updated widget alert
     * @returns promise with the updated alert
     */
    updateWidgetAlert(alert: IWidgetAlert | IWidgetAlertDefinition): Promise<IWidgetAlert>;

    /**
     * Delete widget alert with the given reference
     *
     * @param ref - widget alert reference
     * @returns promise
     */
    deleteWidgetAlert(ref: ObjRef): Promise<void>;

    /**
     * Widget alerts bulk delete
     *
     * @param refs - widget alerts references
     * @returns promise
     */
    deleteWidgetAlerts(refs: ObjRef[]): Promise<void>;

    /**
     * Get all metadata objects referenced by a given widget.
     *
     * @param widget - widget to get referenced objects for
     * @param types - optional array of object types to include, when not specified, all supported references will
     *  be retrieved
     */
    getWidgetReferencedObjects(
        widget: IWidget,
        types?: SupportedWidgetReferenceTypes[],
    ): Promise<IWidgetReferences>;

    /**
     * Takes a widget and a list of filters and returns filters that can be used for the widget.
     * - for attribute filters, these are filters that should NOT be ignored according to the ignoreDashboardFilters property.
     * - for date filters it is the last filter with the same date dimension as specified in dateDataSet property.
     * DOES NOT SUPPORT MULTIPLE DATE FILTERS. If you want to provide multiple date filters, pls refer to getResolvedFiltersForWidgetWithMultipleDateFilters
     *
     * The implementation MUST take different ObjRef types into account, for example if an incoming filter
     * uses idRef and an ignoreDashboardFilters item uses uriRef but they point to the same metadata object,
     * the filter MUST NOT be included in the result.
     *
     * @param widget - widget to get filters for
     * @param filters - filters to apply on the widget
     * @param attributeFilterConfigs - filter configs
     * @returns promise with the filters with the ignored filters removed
     */
    getResolvedFiltersForWidget(
        widget: IWidget,
        filters: IFilter[],
        attributeFilterConfigs: IDashboardAttributeFilterConfig[],
    ): Promise<IFilter[]>;

    /**
     * Takes a widget, commonDateFilters and a list of other filters and returns filters that can be used for the widget.
     * - common date filters are used only when match widget's date data set. If multiple of them match the last one is used
     * - other date filters - these are filters that should NOT be ignored according to the ignoreDashboardFilters property. May have date data sets different from one in widget's definition
     * - for attribute filters - these are filters that should NOT be ignored according to the ignoreDashboardFilters property.
     *
     * The implementation MUST take different ObjRef types into account, for example if an incoming filter
     * uses idRef and an ignoreDashboardFilters item uses uriRef but they point to the same metadata object,
     * the filter MUST NOT be included in the result.
     *
     * @param widget - widget to get filters for
     * @param commonDateFilters - date filters to apply on the widget only when matching its date dataSet
     * @param otherFilters - filters to apply on the widget
     * @param attributeFilterConfigs - filter configs
     * @returns promise with the filters with the ignored filters removed
     */
    getResolvedFiltersForWidgetWithMultipleDateFilters(
        widget: IWidget,
        commonDateFilters: IDateFilter[],
        otherFilters: IFilter[],
        attributeFilterConfigs: IDashboardAttributeFilterConfig[],
    ): Promise<IFilter[]>;

    /**
     * Gets all dashboard plugins registered in the current workspace.
     *
     * @param options - options that specify how the plugin should be loaded
     */
    getDashboardPlugins(options?: IGetDashboardPluginOptions): Promise<IDashboardPlugin[]>;

    /**
     * Load dashboard plugin by it's reference.
     *
     * @param ref - plugin reference
     * @param options - options that specify how the plugin should be loaded
     */
    getDashboardPlugin(ref: ObjRef, options?: IGetDashboardPluginOptions): Promise<IDashboardPlugin>;

    /**
     * Creates a record about a dashboard plugin. Creating a new dashboard plugin does not impact any
     * existing dashboards in the workspace.
     *
     * In order to use a plugin on a dashboard, you need to create a link between the dashboard and the
     * plugin. Multiple dashboards may link to a single plugin; each dashboard may link to the plugin with
     * different plugin-specific parameters.
     *
     * @remarks
     * Analytical Backend only allows creating new dashboard plugins or deleting existing plugins. The goal
     * behind this decision is to encourage safe, phased rollout of new plugin versions. You must first
     * create a new dashboard plugin and then explicitly start using this new version on dashboards in
     * order for changes to take effect.
     *
     * @param plugin - definition of plugin to create
     */
    createDashboardPlugin(plugin: IDashboardPluginDefinition): Promise<IDashboardPlugin>;

    /**
     * Deletes a record about a dashboard plugin from the backend.
     *
     * @remarks
     * -  some backend implementations may reject to delete a dashboard plugin that is used on existing dashboards
     *
     * @param ref - reference to plugin to
     */
    deleteDashboardPlugin(ref: ObjRef): Promise<void>;

    /**
     * Get current user's permissions to the dashboard.
     *
     * @param ref - dashboard reference
     */
    getDashboardPermissions(ref: ObjRef): Promise<IDashboardPermissions>;

    /**
     * Checks whether dashboards exist for current user. Returns sanitized array of existing dashboards according to user's
     * permissions to access or drill to them.
     *
     * @param dashboardRefs - dashboard references to validate
     */
    validateDashboardsExistence(dashboardRefs: ObjRef[]): Promise<IExistingDashboard[]>;

    /**
     * Get a list of filter views for the current user.
     *
     * @param dashboardRef - ref of the dashboard for which we want to get the filter views.
     */
    getFilterViewsForCurrentUser(dashboardRef: ObjRef): Promise<IDashboardFilterView[]>;

    /**
     * Create a new filter view.
     *
     * @param filterView - filter view that must be created.
     */
    createFilterView(filterView: IDashboardFilterViewSaveRequest): Promise<IDashboardFilterView>;

    /**
     * Delete a filter view identified by the provided ref.
     *
     * @param ref - ref of the filter view that must be deleted.
     */
    deleteFilterView(ref: ObjRef): Promise<void>;

    /**
     * Set a filter view identified by the provided ref as the default one.
     * The other filter views for the same dashboard that are marked as default ones will be unmarked.
     *
     * @param ref - ref of the filter view that must be set as default.
     * @param isDefault - determine if filter view identified by the provided ref should be marked as a default
     *      one. If yes, any existing filter view for the same user and dashboard will be marked as non default
     *      as only one can be set as default at the same time.
     */
    setFilterViewAsDefault(ref: ObjRef, isDefault: boolean): Promise<void>;
}

/**
 * Service to query dashboards.
 *
 * @public
 */
export interface IDashboardsQuery {
    /**
     * Sets number of dashboards to return per page.
     * Default size: 50
     *
     * @param size - desired max number of dashboards per page must be a positive number
     * @returns dashboards query
     */
    withSize(size: number): IDashboardsQuery;

    /**
     * Sets starting page for the query. Backend WILL return no data if the page is greater than
     * total number of pages.
     * Default page: 0
     *
     * @param page - zero indexed, must be non-negative
     * @returns dashboards query
     */
    withPage(page: number): IDashboardsQuery;

    /**
     * Sets filter for the query.
     *
     * @param filter - filter to apply
     * @returns dashboards query
     */
    withFilter(filter: IFilterBaseOptions): IDashboardsQuery;

    /**
     * Sets sorting for the query.
     *
     * @param sort - Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
     * @returns dashboards query
     */
    withSorting(sort: string[]): IDashboardsQuery;

    /**
     * Sets include for the query.
     *
     * @param include - include to apply
     * @returns dashboards query
     */
    withInclude(include: string[]): IDashboardsQuery;

    /**
     * Sets origin for the query.

     * @param origin - origin to apply. This is an open string union to allow platform-specific origin values in addition to the built-in literals.
     * @returns dashboards query
     */
    withOrigin(origin: ObjectOrigin | (string & {})): IDashboardsQuery;

    /**
     * Starts the dashboards query.
     *
     * @returns promise of first page of the results
     */
    query(): Promise<IDashboardsQueryResult>;
}

/**
 * Queried dashboards are returned in a paged representation.
 *
 * @public
 */
export type IDashboardsQueryResult = IPagedResource<IListedDashboard>;
