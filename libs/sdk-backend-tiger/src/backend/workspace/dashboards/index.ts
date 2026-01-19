// (C) 2020-2026 GoodData Corporation

import { isEmpty, isEqual } from "lodash-es";
import { invariant } from "ts-invariant";
import { v4 as uuid } from "uuid";

import {
    AnalyticalDashboardModelV2,
    type EntitiesApiGetEntityAnalyticalDashboardsRequest,
    type ExportAFM,
    type ExportRawExportRequest,
    type ITigerClientBase,
    type ImageExportRequest,
    type JsonApiAnalyticalDashboardOutDocument,
    type JsonApiFilterViewOutDocument,
    MetadataUtilities,
    ValidateRelationsHeader,
    isDashboardPluginsItem,
    isDataSetItem,
    isVisualizationObjectsItem,
    jsonApiHeaders,
} from "@gooddata/api-client-tiger";
import { ActionsApi_GetDependentEntitiesGraph } from "@gooddata/api-client-tiger/endpoints/actions";
import {
    DashboardsApi_CreateEntityAnalyticalDashboards,
    DashboardsApi_DeleteEntityAnalyticalDashboards,
    DashboardsApi_GetAllEntitiesAnalyticalDashboards,
    DashboardsApi_GetEntityAnalyticalDashboards,
    DashboardsApi_PatchEntityAnalyticalDashboards,
    DashboardsApi_UpdateEntityAnalyticalDashboards,
    EntitiesApi_CreateEntityDashboardPlugins,
    EntitiesApi_DeleteEntityDashboardPlugins,
    EntitiesApi_GetAllEntitiesDashboardPlugins,
    EntitiesApi_GetEntityDashboardPlugins,
    EntitiesApi_GetEntityWorkspaces,
    FilterContextApi_CreateEntityFilterContexts,
    FilterContextApi_GetEntityFilterContexts,
    FilterContextApi_UpdateEntityFilterContexts,
    FilterViewsApi_CreateEntityFilterViews,
    FilterViewsApi_DeleteEntityFilterViews,
    FilterViewsApi_GetAllEntitiesFilterViews,
    FilterViewsApi_GetEntityFilterViews,
    FilterViewsApi_PatchEntityFilterViews,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import {
    ExportApi_CreateDashboardExportRequest,
    ExportApi_CreateImageExport,
    ExportApi_CreatePdfExport,
    ExportApi_CreateRawExport,
    ExportApi_CreateSlidesExport,
    ExportApi_GetMetadata,
    ExportApi_GetSlidesExportMetadata,
} from "@gooddata/api-client-tiger/endpoints/export";
import { ProfileApi_GetCurrent } from "@gooddata/api-client-tiger/endpoints/profile";
import {
    type IDashboardExportImageOptions,
    type IDashboardExportPdfOptions,
    type IDashboardExportPresentationOptions,
    type IDashboardExportRawOptions,
    type IDashboardExportTabularOptions,
    type IDashboardReferences,
    type IDashboardWithReferences,
    type IDashboardsQuery,
    type IExportResult,
    type IGetDashboardOptions,
    type IGetDashboardPluginOptions,
    type IRawExportCustomOverrides,
    type IWorkspaceDashboardsService,
    NotSupported,
    type SupportedDashboardReferenceTypes,
    UnexpectedError,
    walkLayout,
} from "@gooddata/sdk-backend-spi";
import {
    type FilterContextItem,
    type IDashboard,
    type IDashboardAttributeFilterConfig,
    type IDashboardBase,
    type IDashboardDefinition,
    type IDashboardFilterView,
    type IDashboardFilterViewSaveRequest,
    type IDashboardObjectIdentity,
    type IDashboardPermissions,
    type IDashboardPlugin,
    type IDashboardPluginDefinition,
    type IDashboardWidget,
    type IDateFilter,
    type IExecutionDefinition,
    type IFilter,
    type IFilterContext,
    type IFilterContextDefinition,
    type IListedDashboard,
    type ITempFilterContext,
    type IWidget,
    type ObjRef,
    areObjRefsEqual,
    idRef,
    isAllTimeDashboardDateFilter,
    isFilterContext,
    isFilterContextDefinition,
    isInsightWidget,
    isTempFilterContext,
    objRefToString,
} from "@gooddata/sdk-model";

import { type TigerDashboardPermissionType, buildDashboardPermissions } from "./dashboardPermissions.js";
import { DashboardsQuery } from "./dashboardsQuery.js";
import { resolveWidgetFilters, resolveWidgetFiltersWithMultipleDateFilters } from "./widgetFilters.js";
import {
    convertAnalyticalDashboardToListItems,
    convertDashboard,
    convertDashboardPluginFromBackend,
    convertDashboardPluginWithLinksFromBackend,
    convertFilterContextFromBackend,
} from "../../../convertors/fromBackend/analyticalDashboards/AnalyticalDashboardConverter.js";
import { convertDataSetItem } from "../../../convertors/fromBackend/DataSetConverter.js";
import { convertExportMetadata as convertFromBackendExportMetadata } from "../../../convertors/fromBackend/ExportMetadataConverter.js";
import { convertFilterView } from "../../../convertors/fromBackend/FilterViewConvertor.js";
import { visualizationObjectsItemToInsight } from "../../../convertors/fromBackend/InsightConverter.js";
import { toAfmExecution } from "../../../convertors/toBackend/afm/toAfmResultSpec.js";
import {
    convertAnalyticalDashboard,
    convertDashboardPluginToBackend,
    convertFilterContextToBackend,
    convertFilterViewContextToBackend,
} from "../../../convertors/toBackend/AnalyticalDashboardConverter.js";
import { convertExportMetadata as convertToBackendExportMetadata } from "../../../convertors/toBackend/ExportMetadataConverter.js";
import { cloneWithSanitizedIds } from "../../../convertors/toBackend/IdSanitization.js";
import { type FiltersByTab, type TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { objRefToIdentifier, objRefsToIdentifiers } from "../../../utils/api.js";
import { convertApiError } from "../../../utils/errorHandling.js";
import { handleExportResultPolling } from "../../../utils/exportPolling.js";
import { addFilterLocalIdentifier } from "../../../utils/filterLocalidentifier.js";
import { GET_OPTIMIZED_WORKSPACE_PARAMS } from "../constants.js";
import { getSettingsForCurrentUser } from "../settings/index.js";

export class TigerWorkspaceDashboards implements IWorkspaceDashboardsService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        public readonly workspace: string,
    ) {}

    // Public methods
    public getDashboards = async (options?: IGetDashboardOptions): Promise<IListedDashboard[]> => {
        const includeUser = options?.loadUserData
            ? { include: ["createdBy" as const, "modifiedBy" as const] }
            : {};
        const result = await this.authCall((client) => {
            return MetadataUtilities.getAllPagesOf(
                client,
                DashboardsApi_GetAllEntitiesAnalyticalDashboards,
                { workspaceId: this.workspace, metaInclude: ["accessInfo"], ...includeUser },
                // TODO we need to show dashboards with invalid references now, later this should be rework or removed completely (related to NAS-140)
                // { headers: ValidateRelationsHeader },
            )
                .then(MetadataUtilities.mergeEntitiesResults)
                .then(MetadataUtilities.filterValidEntities);
        });

        return convertAnalyticalDashboardToListItems(result);
    };

    public getDashboardsQuery = (): IDashboardsQuery => {
        return new DashboardsQuery(this.authCall, {
            workspaceId: this.workspace,
        });
    };

    public getDashboard = async (
        ref: ObjRef,
        filterContextRef?: ObjRef,
        options?: IGetDashboardOptions,
    ): Promise<IDashboard> => {
        const includeUser = options?.loadUserData ? ["createdBy" as const, "modifiedBy" as const] : [];
        const id = objRefToIdentifier(ref, this.authCall);
        const result = await this.authCall((client) => {
            return DashboardsApi_GetEntityAnalyticalDashboards(
                client.axios,
                client.basePath,
                {
                    workspaceId: this.workspace,
                    objectId: id,
                    include: ["filterContexts", ...includeUser],
                    metaInclude: ["accessInfo"],
                },
                {
                    headers: jsonApiHeaders,
                },
            );
        });

        const { filterContext, title, hideWidgetTitles } = await this.prepareMetadata(
            options?.exportId,
            options?.exportType,
            filterContextRef,
            options?.exportTabId,
        );

        const dashboard = convertDashboard(result.data, filterContext);
        return updateDashboard(dashboard, title, hideWidgetTitles);
    };

    public getDashboardWithReferences = async (
        ref: ObjRef,
        filterContextRef?: ObjRef,
        options?: IGetDashboardOptions,
        types: SupportedDashboardReferenceTypes[] = ["insight", "dashboardPlugin"],
    ): Promise<IDashboardWithReferences> => {
        const dashboard = await this.getDashboardWithSideloads(ref, types, options);
        const included = dashboard.included || [];
        const insights = included
            .filter(isVisualizationObjectsItem)
            .map((insight) => visualizationObjectsItemToInsight(insight, included));
        const plugins = included
            .filter(isDashboardPluginsItem)
            .map((plugin) => convertDashboardPluginWithLinksFromBackend(plugin, included));

        const dataSets = included.filter(isDataSetItem).map((dataSet) => convertDataSetItem(dataSet));

        const { filterContext, title, hideWidgetTitles } = await this.prepareMetadata(
            options?.exportId,
            options?.exportType,
            filterContextRef,
            options?.exportTabId,
        );

        let updatedDashboard = convertDashboard(dashboard, filterContext);
        updatedDashboard = updateDashboard(updatedDashboard, title, hideWidgetTitles);

        return {
            dashboard: updatedDashboard,
            references: {
                insights,
                plugins,
                dataSets,
            },
        };
    };

    public getDashboardReferencedObjects = (
        dashboard: IDashboard,
        types: SupportedDashboardReferenceTypes[] = ["insight"],
    ): Promise<IDashboardReferences> => {
        return this.getDashboardWithSideloads(dashboard.ref, types).then((result) => {
            const included = result.included || [];

            return {
                insights: included
                    .filter(isVisualizationObjectsItem)
                    .map((insight) => visualizationObjectsItemToInsight(insight, included)),
                plugins: included
                    .filter(isDashboardPluginsItem)
                    .map((plugin) => convertDashboardPluginWithLinksFromBackend(plugin, included)),
                dataSets: included.filter(isDataSetItem).map((dataSet) => convertDataSetItem(dataSet)),
            };
        });
    };

    public getFilterContextByExportId = async (
        exportId: string,
        type: "visual" | "slides" | undefined,
        exportTabId?: string,
    ): Promise<{ filterContext?: IFilterContext; title?: string; hideWidgetTitles?: boolean } | null> => {
        const metadata = await this.authCall((client) => {
            if (type === "slides") {
                return ExportApi_GetSlidesExportMetadata(client.axios, client.basePath, {
                    workspaceId: this.workspace,
                    exportId,
                });
            }
            return ExportApi_GetMetadata(client.axios, client.basePath, {
                workspaceId: this.workspace,
                exportId,
            });
        })
            .then((result) => result.data)
            .catch(() => null);

        if (!metadata) {
            // Error during fetching of export metadata: return null and
            // fallback to default filters later.
            return null;
        }

        const userSettings = await getSettingsForCurrentUser(this.authCall, this.workspace);
        const enableAutomationFilterContext = userSettings.enableAutomationFilterContext ?? true;

        const convertedExportMetadata = convertFromBackendExportMetadata(
            metadata,
            enableAutomationFilterContext,
        );

        const filterContextFromFilters = convertedExportMetadata?.filters
            ? {
                  filterContext: {
                      filters: convertedExportMetadata.filters,
                      title: `temp-filter-context-${exportId}`,
                      description: "temp-filter-context-description",
                      ref: { identifier: `identifier-${exportId}` },
                      uri: `uri-${exportId}`,
                      identifier: `identifier-${exportId}`,
                  },
              }
            : undefined;

        const filterContextFromFiltersByTab =
            convertedExportMetadata?.filtersByTab &&
            exportTabId &&
            convertedExportMetadata.filtersByTab[exportTabId]
                ? {
                      filterContext: {
                          filters: convertedExportMetadata.filtersByTab[exportTabId],
                          title: `temp-filter-context-${exportId}`,
                          description: "temp-filter-context-description",
                          ref: { identifier: `identifier-${exportId}` },
                          uri: `uri-${exportId}`,
                          identifier: `identifier-${exportId}`,
                      },
                  }
                : undefined;

        const filterContext = filterContextFromFiltersByTab || filterContextFromFilters;

        return {
            ...(filterContext || {}),
            ...(convertedExportMetadata?.title ? { title: convertedExportMetadata.title } : {}),
            ...(convertedExportMetadata?.hideWidgetTitles
                ? { hideWidgetTitles: convertedExportMetadata.hideWidgetTitles }
                : {}),
        };
    };

    private getDashboardWithSideloads = async (
        ref: ObjRef,
        types: SupportedDashboardReferenceTypes[],
        options?: IGetDashboardOptions,
    ): Promise<JsonApiAnalyticalDashboardOutDocument> => {
        const includeUser = options?.loadUserData ? ["createdBy" as const, "modifiedBy" as const] : [];
        const include: EntitiesApiGetEntityAnalyticalDashboardsRequest["include"] = [
            "filterContexts",
            ...includeUser,
        ];

        if (types.includes("insight")) {
            include.push("visualizationObjects");
        }

        if (types.includes("dataSet")) {
            include.push("datasets");
        }

        if (types.includes("dashboardPlugin")) {
            include.push("dashboardPlugins");
        }

        const id = objRefToIdentifier(ref, this.authCall);

        return this.authCall((client) =>
            DashboardsApi_GetEntityAnalyticalDashboards(
                client.axios,
                client.basePath,
                {
                    workspaceId: this.workspace,
                    objectId: id,
                    include,
                    metaInclude: ["accessInfo"],
                },
                {
                    headers: jsonApiHeaders,
                },
            ).then((result) => result.data),
        );
    };

    public createDashboard = async (dashboard: IDashboardDefinition): Promise<IDashboard> => {
        // Process root-level filter context for backward compatibility
        const filterContext = await this.processFilterContextForCreation(dashboard.filterContext);

        // Process filter contexts for each tab if tabs are present
        const dashboardWithTabFilterContexts = await this.processDashboardTabsFilterContexts(dashboard);

        const userSettings = await getSettingsForCurrentUser(this.authCall, this.workspace);
        const isWidgetIdentifiersEnabled = userSettings.enableWidgetIdentifiersRollout ?? true;
        const enableDashboardSectionHeadersDateDataSet =
            userSettings.enableDashboardSectionHeadersDateDataSet ?? false;

        const dashboardContent = convertAnalyticalDashboard(
            dashboardWithTabFilterContexts,
            filterContext?.ref,
            isWidgetIdentifiersEnabled,
            enableDashboardSectionHeadersDateDataSet,
        );
        const result = await this.authCall((client) => {
            return DashboardsApi_CreateEntityAnalyticalDashboards(
                client.axios,
                client.basePath,
                {
                    workspaceId: this.workspace,
                    jsonApiAnalyticalDashboardPostOptionalIdDocument: {
                        data: {
                            type: "analyticalDashboard",
                            attributes: {
                                content: dashboardContent,
                                title: dashboard.title,
                                description: dashboard.description || "",
                                ...(dashboard.tags ? { tags: dashboard.tags } : {}),
                            },
                        },
                    },
                },
                {
                    headers: jsonApiHeaders,
                },
            );
        });

        // TODO: TNT-1310 Revert back to `return convertDashboard(result.data, filterContext)`
        const { id, type } = result.data.data;
        return this.getDashboard(idRef(id, type));
    };

    public updateDashboard = async (
        originalDashboard: IDashboard,
        updatedDashboard: IDashboardDefinition,
    ): Promise<IDashboard> => {
        if (!areObjRefsEqual(originalDashboard.ref, updatedDashboard.ref)) {
            throw new Error("Cannot update dashboard with different refs!");
        } else if (isEqual(originalDashboard, updatedDashboard)) {
            return originalDashboard;
        }

        // Missing refs means that the dashboard is not yet stored, so let's create it
        if (!originalDashboard.ref && !updatedDashboard.ref) {
            return this.createDashboard(updatedDashboard);
        }

        // Process root-level filter context for backward compatibility
        const filterContext = await this.processFilterContextUpdate(
            originalDashboard.filterContext,
            updatedDashboard.filterContext,
        );

        // Process filter contexts for each tab if tabs are present
        let updatedDashboardWithTabFilterContexts = updatedDashboard;
        if (updatedDashboard.tabs && updatedDashboard.tabs.length > 0) {
            const tabsWithProcessedFilterContexts = await Promise.all(
                updatedDashboard.tabs.map(async (updatedTab) => {
                    const originalTab = originalDashboard.tabs?.find(
                        (t) => t.localIdentifier === updatedTab.localIdentifier,
                    );

                    // Process the tab's filter context
                    const tabFilterContext = await this.processFilterContextUpdate(
                        originalTab?.filterContext,
                        updatedTab.filterContext,
                    );

                    return {
                        ...updatedTab,
                        filterContext: tabFilterContext,
                    };
                }),
            );

            updatedDashboardWithTabFilterContexts = {
                ...updatedDashboard,
                tabs: tabsWithProcessedFilterContexts,
            };
        }

        const objectId = objRefToIdentifier(originalDashboard.ref, this.authCall);
        const userSettings = await getSettingsForCurrentUser(this.authCall, this.workspace);
        const isWidgetIdentifiersEnabled = userSettings.enableWidgetIdentifiersRollout ?? true;
        const enableDashboardSectionHeadersDateDataSet =
            userSettings.enableDashboardSectionHeadersDateDataSet ?? false;
        const dashboardContent = convertAnalyticalDashboard(
            updatedDashboardWithTabFilterContexts,
            filterContext?.ref,
            isWidgetIdentifiersEnabled,
            enableDashboardSectionHeadersDateDataSet,
        );

        const result = await this.authCall((client) => {
            return DashboardsApi_UpdateEntityAnalyticalDashboards(
                client.axios,
                client.basePath,
                {
                    workspaceId: this.workspace,
                    objectId,
                    jsonApiAnalyticalDashboardInDocument: {
                        data: {
                            id: objectId,
                            type: "analyticalDashboard",
                            attributes: {
                                content: dashboardContent,
                                title: updatedDashboard.title,
                                description: updatedDashboard.description || "",
                                ...(updatedDashboard.tags ? { tags: updatedDashboard.tags } : {}),
                            },
                        },
                    },
                },
                {
                    headers: jsonApiHeaders,
                },
            );
        });

        /**
         * Getting the dashboard again to get the shareStatus of the dashboard
         * When NAS-4822 is completed, we can add `metainclude: ["accessInfo"],` to the payload above
         * and return just `convertDashboard(result.data, filterContext);` below
         */
        const { id, type } = result.data.data;
        return this.getDashboard(idRef(id, type));
    };

    public updateDashboardMeta = async (
        updatedDashboard: IDashboardObjectIdentity & Partial<IDashboardBase>,
    ): Promise<IDashboard> => {
        const objectId = objRefToIdentifier(updatedDashboard.ref, this.authCall);

        const result = await this.authCall((client) => {
            return DashboardsApi_PatchEntityAnalyticalDashboards(
                client.axios,
                client.basePath,
                {
                    workspaceId: this.workspace,
                    objectId,
                    jsonApiAnalyticalDashboardPatchDocument: {
                        data: {
                            id: objectId,
                            type: "analyticalDashboard",
                            attributes: {
                                ...(updatedDashboard.title === undefined
                                    ? {}
                                    : { title: updatedDashboard.title }),
                                ...(updatedDashboard.description === undefined
                                    ? {}
                                    : { description: updatedDashboard.description }),
                                ...(updatedDashboard.tags === undefined
                                    ? {}
                                    : { tags: updatedDashboard.tags }),
                            },
                        },
                    },
                },
                {
                    headers: jsonApiHeaders,
                },
            );
        });

        /**
         * Getting the dashboard again to get the shareStatus of the dashboard
         * When NAS-4822 is completed, we can add `metainclude: ["accessInfo"],` to the payload above
         * and return just `convertDashboard(result.data, filterContext);` below
         */
        const { id, type } = result.data.data;
        return this.getDashboard(idRef(id, type));
    };

    public deleteDashboard = async (ref: ObjRef): Promise<void> => {
        const id = objRefToIdentifier(ref, this.authCall);

        await this.authCall((client) =>
            DashboardsApi_DeleteEntityAnalyticalDashboards(
                client.axios,
                client.basePath,
                {
                    objectId: id,
                    workspaceId: this.workspace,
                },
                {
                    headers: jsonApiHeaders,
                },
            ),
        );
    };

    public exportDashboardToPdf = async (
        dashboardRef: ObjRef,
        filters?: FilterContextItem[],
        filtersByTab?: FiltersByTab,
        options?: IDashboardExportPdfOptions,
    ): Promise<IExportResult> => {
        const dashboardId = objRefToIdentifier(dashboardRef, this.authCall);

        // skip all time date filter from stored filters, when missing, it's correctly
        // restored to All time during the load later
        const withoutAllTime = (filters || []).filter((f) => !isAllTimeDashboardDateFilter(f));

        const withoutAllTimePerTab = Object.entries(filtersByTab || {}).reduce((acc, [tabId, filters]) => {
            return {
                ...acc,
                [tabId]: filters.filter((f) => !isAllTimeDashboardDateFilter(f)),
            };
        }, {});

        return this.authCall(async (client) => {
            const dashboardResponse = await DashboardsApi_GetEntityAnalyticalDashboards(
                client.axios,
                client.basePath,
                {
                    workspaceId: this.workspace,
                    objectId: dashboardId,
                },
                {
                    headers: jsonApiHeaders,
                },
            );

            const { title } = convertDashboard(dashboardResponse.data);
            const visualExportRequest = {
                fileName: options?.filename ?? title,
                dashboardId,
                metadata: convertToBackendExportMetadata({
                    filters: withoutAllTime,
                    filtersByTab: withoutAllTimePerTab,
                }),
            };
            const pdfExport = await ExportApi_CreatePdfExport(client.axios, client.basePath, {
                workspaceId: this.workspace,
                exportVisualExportRequest: visualExportRequest,
            });

            return await handleExportResultPolling(
                client,
                {
                    workspaceId: this.workspace,
                    exportId: pdfExport?.data?.exportResult,
                },
                "getExportedFile",
                options?.timeout,
            );
        });
    };

    public exportDashboardToPresentation = async (
        dashboardRef: ObjRef,
        format: "PDF" | "PPTX",
        filters?: FilterContextItem[],
        filtersByTab?: FiltersByTab,
        options?: IDashboardExportPresentationOptions,
    ): Promise<IExportResult> => {
        const dashboardId = objRefToIdentifier(dashboardRef, this.authCall);

        // skip all time date filter from stored filters, when missing, it's correctly
        // restored to All time during the load later
        const withoutAllTime = (filters || []).filter((f) => !isAllTimeDashboardDateFilter(f));

        const withoutAllTimePerTab = Object.entries(filtersByTab || {}).reduce((acc, [tabId, filters]) => {
            return {
                ...acc,
                [tabId]: filters.filter((f) => !isAllTimeDashboardDateFilter(f)),
            };
        }, {});

        return this.authCall(async (client) => {
            const dashboardResponse = await DashboardsApi_GetEntityAnalyticalDashboards(
                client.axios,
                client.basePath,
                {
                    workspaceId: this.workspace,
                    objectId: dashboardId,
                },
                {
                    headers: jsonApiHeaders,
                },
            );

            const { title } = convertDashboard(dashboardResponse.data);
            const slidesExportRequest = {
                format,
                dashboardId,
                fileName: options?.filename ?? title,
                widgetIds: options?.widgetIds?.map((widgetId) => objRefToString(widgetId)),
                visualizationIds: options?.visualizationIds?.map((visualizationId) =>
                    objRefToString(visualizationId),
                ),
                templateId: options?.templateId,
                metadata: convertToBackendExportMetadata({
                    filters: withoutAllTime,
                    filtersByTab: withoutAllTimePerTab,
                    title: options?.title,
                    hideWidgetTitles: options?.hideWidgetTitles,
                }),
            };
            const slideshowExport = await ExportApi_CreateSlidesExport(client.axios, client.basePath, {
                workspaceId: this.workspace,
                exportSlidesExportRequest: slidesExportRequest,
            });

            return await handleExportResultPolling(
                client,
                {
                    workspaceId: this.workspace,
                    exportId: slideshowExport?.data?.exportResult,
                },
                "getSlidesExport",
                options?.timeout,
            );
        });
    };

    public exportDashboardToTabular = async (
        dashboardRef: ObjRef,
        options?: IDashboardExportTabularOptions,
    ): Promise<IExportResult> => {
        const dashboardId = objRefToIdentifier(dashboardRef, this.authCall);

        return this.authCall(async (client) => {
            let title: string;
            if (options?.title) {
                title = options.title;
            } else {
                const dashboardResponse = await DashboardsApi_GetEntityAnalyticalDashboards(
                    client.axios,
                    client.basePath,
                    {
                        workspaceId: this.workspace,
                        objectId: dashboardId,
                    },
                    {
                        headers: jsonApiHeaders,
                    },
                );
                title = convertDashboard(dashboardResponse.data).title;
            }

            const dashboardFiltersOverrideObj = options?.dashboardFiltersOverride
                ? { dashboardFiltersOverride: cloneWithSanitizedIds(options?.dashboardFiltersOverride) }
                : {};

            const dashboardTabsFiltersOverridesObj =
                options?.dashboardTabsFiltersOverrides &&
                Object.keys(options.dashboardTabsFiltersOverrides).length > 0
                    ? {
                          dashboardTabsFiltersOverrides: Object.entries(
                              options.dashboardTabsFiltersOverrides,
                          ).reduce((acc, [tabId, filters]) => {
                              return {
                                  ...acc,
                                  [tabId]: cloneWithSanitizedIds(filters),
                              };
                          }, {}),
                      }
                    : {};

            const format = options?.format || "XLSX";
            const tabularExport = await ExportApi_CreateDashboardExportRequest(
                client.axios,
                client.basePath,
                {
                    exportDashboardTabularExportRequest: {
                        fileName: title || "export",
                        format,
                        settings: {
                            ...(format === "XLSX" && {
                                mergeHeaders: options?.mergeHeaders,
                                exportInfo: options?.exportInfo,
                            }),
                            ...(format === "PDF" && options?.pdfConfiguration
                                ? {
                                      pageSize: options.pdfConfiguration.pageSize,
                                      pageOrientation: options.pdfConfiguration.pageOrientation,
                                      exportInfo: options.pdfConfiguration.showInfoPage,
                                  }
                                : {}),
                        },
                        widgetIds: options?.widgetIds,
                        ...dashboardFiltersOverrideObj,
                        ...dashboardTabsFiltersOverridesObj,
                    },
                    workspaceId: this.workspace,
                    dashboardId,
                },
            );

            return await handleExportResultPolling(
                client,
                {
                    workspaceId: this.workspace,
                    exportId: tabularExport?.data?.exportResult,
                },
                "getTabularExport",
                options?.timeout,
            );
        });
    };

    public exportDashboardToCSVRaw = async (
        definition: IExecutionDefinition,
        filename: string,
        customOverrides?: IRawExportCustomOverrides,
        options?: IDashboardExportRawOptions,
    ): Promise<IExportResult> => {
        const execution = toAfmExecution(definition);
        const payload: ExportRawExportRequest = {
            format: "CSV",
            execution: execution.execution as ExportAFM,
            fileName: filename,
            executionSettings: execution.settings,
            customOverride: isEmpty(customOverrides)
                ? undefined
                : {
                      metrics: customOverrides?.measures,
                      labels: customOverrides?.displayForms,
                  },
        };

        return this.authCall(async (client) => {
            const rawExport = await ExportApi_CreateRawExport(client.axios, client.basePath, {
                workspaceId: this.workspace,
                exportRawExportRequest: payload,
            });

            return await handleExportResultPolling(
                client,
                {
                    workspaceId: this.workspace,
                    exportId: rawExport?.data?.exportResult,
                },
                "getRawExport",
                options?.timeout,
            );
        });
    };

    public exportDashboardToImage = async (
        dashboardRef: ObjRef,
        filters?: FilterContextItem[],
        filtersByTab?: FiltersByTab,
        options?: IDashboardExportImageOptions,
    ): Promise<IExportResult> => {
        return this.authCall(async (client) => {
            const dashboardId = objRefToIdentifier(dashboardRef, this.authCall);

            // skip all time date filter from stored filters, when missing, it's correctly
            // restored to All time during the load later
            const withoutAllTime = (filters || []).filter((f) => !isAllTimeDashboardDateFilter(f));

            const withoutAllTimePerTab = Object.entries(filtersByTab || {}).reduce(
                (acc, [tabId, filters]) => {
                    return {
                        ...acc,
                        [tabId]: filters.filter((f) => !isAllTimeDashboardDateFilter(f)),
                    };
                },
                {},
            );

            const imageExportRequest: ImageExportRequest = {
                format: "PNG",
                fileName: options?.filename || "export",
                dashboardId,
                widgetIds:
                    options?.widgetIds?.map((ref) => {
                        if ("identifier" in ref) {
                            return ref.identifier;
                        }
                        throw new Error("Only identifier references are supported for widget IDs");
                    }) ?? [],
                metadata: convertToBackendExportMetadata({
                    filters: withoutAllTime,
                    filtersByTab: withoutAllTimePerTab,
                    title: options?.filename,
                }),
            };

            const imageExport = await ExportApi_CreateImageExport(client.axios, client.basePath, {
                workspaceId: this.workspace,
                exportImageExportRequest: imageExportRequest,
            });

            return await handleExportResultPolling(
                client,
                {
                    workspaceId: this.workspace,
                    exportId: imageExport?.data?.exportResult,
                },
                "getImageExport",
                options?.timeout,
            );
        });
    };

    public createScheduledMail = () => {
        throw new NotSupported("Tiger backend does not support scheduled emails.");
    };

    public updateScheduledMail = () => {
        throw new NotSupported("Tiger backend does not support scheduled emails.");
    };

    public deleteScheduledMail = () => {
        throw new NotSupported("Tiger backend does not support scheduled emails.");
    };

    public getScheduledMailsForDashboard = () => {
        throw new NotSupported("Tiger backend does not support scheduled emails.");
    };

    public getScheduledMailsCountForDashboard = () => {
        // FIXME Not supported
        return Promise.resolve(0);
    };

    public getAllWidgetAlertsForCurrentUser = () => {
        // FIXME Not supported
        return Promise.resolve([]);
    };

    public getDashboardWidgetAlertsForCurrentUser = () => {
        throw new NotSupported("Tiger backend does not support alerting.");
    };

    public getWidgetAlertsCountForWidgets = () => {
        // FIXME Not supported
        return Promise.resolve([]);
    };

    public createWidgetAlert = () => {
        throw new NotSupported("Tiger backend does not support alerting.");
    };

    public updateWidgetAlert = () => {
        throw new NotSupported("Tiger backend does not support alerting.");
    };

    public deleteWidgetAlert = () => {
        throw new NotSupported("Tiger backend does not support alerting.");
    };

    public deleteWidgetAlerts = () => {
        throw new NotSupported("Tiger backend does not support alerting.");
    };

    public getWidgetReferencedObjects = () => {
        throw new NotSupported("Tiger backend does not support alerting.");
    };

    public getResolvedFiltersForWidget = async (
        widget: IWidget,
        filters: IFilter[],
        attributeFilterConfigs: IDashboardAttributeFilterConfig[],
    ): Promise<IFilter[]> => {
        return Promise.resolve(
            resolveWidgetFilters(
                filters,
                widget.ignoreDashboardFilters,
                widget.dateDataSet,
                (refs) => objRefsToIdentifiers(refs, this.authCall),
                attributeFilterConfigs,
            ),
        );
    };

    public getResolvedFiltersForWidgetWithMultipleDateFilters = async (
        widget: IWidget,
        commonDateFilters: IDateFilter[],
        otherFilters: IFilter[],
        attributeFilterConfigs: IDashboardAttributeFilterConfig[],
    ): Promise<IFilter[]> => {
        return Promise.resolve(
            resolveWidgetFiltersWithMultipleDateFilters(
                commonDateFilters,
                otherFilters,
                widget.ignoreDashboardFilters,
                widget.dateDataSet,
                (refs) => objRefsToIdentifiers(refs, this.authCall),
                attributeFilterConfigs,
            ),
        );
    };

    public createDashboardPlugin = async (plugin: IDashboardPluginDefinition): Promise<IDashboardPlugin> => {
        const pluginContent = convertDashboardPluginToBackend(plugin);

        const result = await this.authCall((client) => {
            return EntitiesApi_CreateEntityDashboardPlugins(
                client.axios,
                client.basePath,
                {
                    workspaceId: this.workspace,
                    jsonApiDashboardPluginPostOptionalIdDocument: {
                        data: {
                            type: "dashboardPlugin",
                            attributes: {
                                content: pluginContent,
                                title: plugin.name,
                                description: plugin.description ?? "",
                            },
                        },
                    },
                },
                {
                    headers: jsonApiHeaders,
                },
            );
        });

        return convertDashboardPluginFromBackend(result.data);
    };

    public deleteDashboardPlugin = async (ref: ObjRef): Promise<void> => {
        const id = objRefToIdentifier(ref, this.authCall);

        await this.authCall((client) =>
            EntitiesApi_DeleteEntityDashboardPlugins(
                client.axios,
                client.basePath,
                {
                    objectId: id,
                    workspaceId: this.workspace,
                },
                {
                    headers: jsonApiHeaders,
                },
            ),
        );
    };

    public getDashboardPlugin = async (
        ref: ObjRef,
        options?: IGetDashboardPluginOptions,
    ): Promise<IDashboardPlugin> => {
        const includeUser = options?.loadUserData
            ? { include: ["createdBy" as const, "modifiedBy" as const] }
            : {};
        const objectId = objRefToIdentifier(ref, this.authCall);
        const result = await this.authCall((client) => {
            return EntitiesApi_GetEntityDashboardPlugins(
                client.axios,
                client.basePath,
                {
                    workspaceId: this.workspace,
                    objectId,
                    ...includeUser,
                },
                {
                    headers: jsonApiHeaders,
                },
            );
        });

        return convertDashboardPluginFromBackend(result.data);
    };

    public getDashboardPlugins = async (
        options?: IGetDashboardPluginOptions,
    ): Promise<IDashboardPlugin[]> => {
        const includeUser = options?.loadUserData
            ? { include: ["createdBy" as const, "modifiedBy" as const] }
            : {};
        const result = await this.authCall((client) => {
            return MetadataUtilities.getAllPagesOf(
                client,
                EntitiesApi_GetAllEntitiesDashboardPlugins,
                { workspaceId: this.workspace, ...includeUser },
                { headers: ValidateRelationsHeader },
            )
                .then(MetadataUtilities.mergeEntitiesResults)
                .then(MetadataUtilities.filterValidEntities);
        });

        return result.data.map((plugin) =>
            convertDashboardPluginWithLinksFromBackend(plugin, result.included),
        );
    };

    public validateDashboardsExistence = async (dashboardRefs: ObjRef[]) => {
        const entitiesGraph = await this.authCall((client) =>
            ActionsApi_GetDependentEntitiesGraph(client.axios, client.basePath, {
                workspaceId: this.workspace,
            }).then((res: any) => res.data.graph),
        );
        const analyticalDashboards = entitiesGraph.nodes.filter(
            ({ type }: { type: string }) => type === "analyticalDashboard",
        );

        // Refs which are not listed in entities graph are non-existent
        const validDashboardRefs = dashboardRefs.filter((ref) => {
            const dashboardId = objRefToString(ref);
            return analyticalDashboards.some(({ id }: { id: string }) => id === dashboardId);
        });

        return validDashboardRefs.map((ref) => ({
            ref,
            identifier: objRefToString(ref),
            uri: "", // uri is not available in entities graph
        }));
    };

    public getFilterViewsForCurrentUser = async (dashboard: ObjRef): Promise<IDashboardFilterView[]> => {
        try {
            const dashboardId = objRefToIdentifier(dashboard, this.authCall);
            const result = await this.authCall(async (client) => {
                const profile = await ProfileApi_GetCurrent(client.axios);
                return FilterViewsApi_GetAllEntitiesFilterViews(client.axios, client.basePath, {
                    workspaceId: this.workspace,
                    include: ["user", "analyticalDashboard"],
                    filter: `analyticalDashboard.id==${dashboardId};user.id==${profile.userId}`,
                    origin: "NATIVE",

                    // sort: ["name"], // TODO LX-422 remove comment and array sort below once sort is supported
                });
            });
            const { data, included } = result.data;
            return data
                .map((itemData) => convertFilterView(itemData, included))
                .sort((a, b) => a.name.localeCompare(b.name));
        } catch (error: any) {
            throw convertApiError(error);
        }
    };

    public createFilterView = async (
        filterView: IDashboardFilterViewSaveRequest,
    ): Promise<IDashboardFilterView> => {
        try {
            const { name, dashboard, isDefault, filterContext, tabLocalIdentifier } = filterView;

            const dashboardId = objRefToIdentifier(dashboard, this.authCall);
            const userSettings = await getSettingsForCurrentUser(this.authCall, this.workspace);
            const useDateFilterLocalIdentifiers = userSettings.enableDateFilterIdentifiersRollout ?? true;
            const enableDashboardTabs = userSettings.enableDashboardTabs ?? false;

            return this.authCall(async (client) => {
                if (isDefault) {
                    // this should ideally be handled by the POST call below so all these calls are just
                    // a single transaction and the action itself is more performant on UI
                    if (enableDashboardTabs && tabLocalIdentifier) {
                        await this.unsetDashboardDefaultFilterView(client, dashboardId, tabLocalIdentifier);
                    } else if (!enableDashboardTabs) {
                        await this.unsetDashboardDefaultFilterView(client, dashboardId);
                    }
                }
                const profile = await ProfileApi_GetCurrent(client.axios);
                const result = await FilterViewsApi_CreateEntityFilterViews(
                    client.axios,
                    client.basePath,
                    {
                        workspaceId: this.workspace,
                        jsonApiFilterViewInDocument: {
                            data: {
                                type: "filterView",
                                id: uuid(),
                                attributes: {
                                    isDefault,
                                    title: name,
                                    content: convertFilterViewContextToBackend(
                                        filterContext,
                                        useDateFilterLocalIdentifiers,
                                        tabLocalIdentifier,
                                    ),
                                },
                                relationships: {
                                    user: {
                                        data: {
                                            id: profile.userId,
                                            type: "user",
                                        },
                                    },
                                    analyticalDashboard: {
                                        data: {
                                            id: dashboardId,
                                            type: "analyticalDashboard",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    {
                        headers: jsonApiHeaders,
                    },
                );

                const { id, type, attributes } = result.data.data;
                const { title, isDefault: persistedIsDefault } = attributes;

                // let's save a one call and do not fetch the whole entity again as we have all the info here
                return {
                    ref: idRef(id, type),
                    dashboard,
                    user: idRef(profile.userId, "user"),
                    name: title,
                    filterContext,
                    isDefault: persistedIsDefault ?? false,
                };
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    };

    public deleteFilterView = async (ref: ObjRef): Promise<void> => {
        try {
            const id = objRefToIdentifier(ref, this.authCall);
            await this.authCall((client) =>
                FilterViewsApi_DeleteEntityFilterViews(client.axios, client.basePath, {
                    workspaceId: this.workspace,
                    objectId: id,
                }),
            );
        } catch (error: any) {
            throw convertApiError(error);
        }
    };

    public setFilterViewAsDefault = async (ref: ObjRef, isDefault: boolean): Promise<void> => {
        const id = objRefToIdentifier(ref, this.authCall);
        const userSettings = await getSettingsForCurrentUser(this.authCall, this.workspace);
        const enableDashboardTabs = userSettings.enableDashboardTabs ?? false;

        await this.authCall(async (client) => {
            if (isDefault) {
                // this should ideally be handled by the PATCH call below so all these calls are just
                // a single transaction and the action itself is more performant on UI
                const filterView = await this.getFilterView(client, id);
                const dashboardId = filterView.data.relationships?.analyticalDashboard?.data?.id;
                invariant(dashboardId, "Dashboard could not be determined for the filter view.");

                if (enableDashboardTabs) {
                    // Extract tabLocalIdentifier from filter view content
                    const content = filterView.data.attributes?.content;
                    const tabLocalIdentifier = AnalyticalDashboardModelV2.isFilterContextWithTab(content)
                        ? content.tabLocalIdentifier
                        : undefined;
                    await this.unsetDashboardDefaultFilterView(client, dashboardId, tabLocalIdentifier);
                } else {
                    await this.unsetDashboardDefaultFilterView(client, dashboardId);
                }
            }
            await this.updateFilterViewDefaultStatus(client, id, isDefault);
        });
    };

    private unsetDashboardDefaultFilterView = async (
        client: ITigerClientBase,
        dashboardId: string,
        tabLocalIdentifier?: string,
    ): Promise<void> => {
        const profile = await ProfileApi_GetCurrent(client.axios);
        const defaultFilterViewsForDashboard = await FilterViewsApi_GetAllEntitiesFilterViews(
            client.axios,
            client.basePath,
            {
                workspaceId: this.workspace,
                include: ["user", "analyticalDashboard"],
                filter: `analyticalDashboard.id==${dashboardId};user.id==${profile.userId};filterView.isDefault==true`,
                origin: "NATIVE",
            },
        );

        // Filter by tabLocalIdentifier if provided (for per-tab defaults)
        const defaultFilterViews = tabLocalIdentifier
            ? defaultFilterViewsForDashboard.data.data.filter((view) => {
                  const content = view.attributes?.content;
                  return (
                      AnalyticalDashboardModelV2.isFilterContextWithTab(content) &&
                      content.tabLocalIdentifier === tabLocalIdentifier
                  );
              })
            : defaultFilterViewsForDashboard.data.data;

        await Promise.all(
            defaultFilterViews.map((view) => this.updateFilterViewDefaultStatus(client, view.id, false)),
        );
    };

    private updateFilterViewDefaultStatus = async (
        client: ITigerClientBase,
        id: string,
        isDefault: boolean,
    ): Promise<void> => {
        await FilterViewsApi_PatchEntityFilterViews(client.axios, client.basePath, {
            workspaceId: this.workspace,
            objectId: id,
            jsonApiFilterViewPatchDocument: {
                data: {
                    id,
                    type: "filterView",
                    attributes: {
                        isDefault,
                    },
                },
            },
        });
    };
    private getFilterView = async (
        client: ITigerClientBase,
        id: string,
    ): Promise<JsonApiFilterViewOutDocument> => {
        return FilterViewsApi_GetEntityFilterViews(client.axios, client.basePath, {
            workspaceId: this.workspace,
            objectId: id,
            include: ["analyticalDashboard"],
        }).then((result) => result.data);
    };

    //
    //
    //

    private createFilterContext = async (
        filterContext: IFilterContextDefinition,
    ): Promise<IFilterContext> => {
        const userSettings = await getSettingsForCurrentUser(this.authCall, this.workspace);
        const useDateFilterLocalIdentifiers = userSettings.enableDateFilterIdentifiersRollout ?? true;

        const tigerFilterContext = convertFilterContextToBackend(
            filterContext,
            useDateFilterLocalIdentifiers,
        );

        const result = await this.authCall((client) => {
            return FilterContextApi_CreateEntityFilterContexts(
                client.axios,
                client.basePath,
                {
                    workspaceId: this.workspace,
                    jsonApiFilterContextPostOptionalIdDocument: {
                        data: {
                            type: "filterContext",
                            attributes: {
                                content: tigerFilterContext,
                                title: filterContext.title || "",
                                description: filterContext.description || "",
                            },
                        },
                    },
                },
                {
                    headers: jsonApiHeaders,
                },
            );
        });

        return convertFilterContextFromBackend(result.data);
    };

    public getDashboardPermissions = async (ref: ObjRef): Promise<IDashboardPermissions> => {
        try {
            const workspaceWithPermissionsResponse = await this.authCall((client) => {
                return EntitiesApi_GetEntityWorkspaces(client.axios, client.basePath, {
                    id: this.workspace,
                    ...GET_OPTIMIZED_WORKSPACE_PARAMS,
                });
            });

            // check if the user is admin who has all the permissions
            const workspacePermissions =
                workspaceWithPermissionsResponse.data.data.meta!.permissions ?? ([] as Array<string>);
            if (workspacePermissions.indexOf("MANAGE") >= 0) {
                return buildDashboardPermissions(["EDIT"]);
            }

            const dashboardObjectId = objRefToIdentifier(ref, this.authCall);
            const dashboardWithPermissionsResponse = await this.authCall((client) => {
                return DashboardsApi_GetEntityAnalyticalDashboards(client.axios, client.basePath, {
                    workspaceId: this.workspace,
                    objectId: dashboardObjectId,
                    metaInclude: ["permissions"],
                });
            });
            const dashboardPermissions =
                dashboardWithPermissionsResponse.data.data.meta!.permissions ??
                ([] as Array<TigerDashboardPermissionType>);

            return buildDashboardPermissions(dashboardPermissions);
        } catch {
            return buildDashboardPermissions([]);
        }
    };

    private processFilterContextForCreation = async (
        filterContext: IFilterContext | ITempFilterContext | IFilterContextDefinition | undefined,
    ): Promise<IFilterContext | ITempFilterContext | undefined> => {
        if (!filterContext) {
            return undefined;
        }
        return isFilterContextDefinition(filterContext)
            ? this.createFilterContext(filterContext)
            : filterContext;
    };

    private processDashboardTabsFilterContexts = async (
        dashboard: IDashboardDefinition,
    ): Promise<IDashboardDefinition> => {
        if (!dashboard.tabs || dashboard.tabs.length === 0) {
            return dashboard;
        }

        const tabsWithProcessedFilterContexts = await Promise.all(
            dashboard.tabs.map(async (tab) => {
                // Create or use existing filter context for this tab
                const tabFilterContext = await this.processFilterContextForCreation(tab.filterContext);
                return tabFilterContext ? { ...tab, filterContext: tabFilterContext } : tab;
            }),
        );

        return {
            ...dashboard,
            tabs: tabsWithProcessedFilterContexts,
        };
    };

    private processFilterContextUpdate = async (
        originalFilterContext: IFilterContext | ITempFilterContext | undefined,
        updatedFilterContext: IFilterContext | ITempFilterContext | IFilterContextDefinition | undefined,
    ): Promise<IFilterContext | undefined> => {
        const userSettings = await getSettingsForCurrentUser(this.authCall, this.workspace);
        const useDateFilterLocalIdentifiers = userSettings.enableDateFilterIdentifiersRollout ?? true;

        const sanitizedFilterContext = useDateFilterLocalIdentifiers
            ? {
                  ...updatedFilterContext,
                  filters: updatedFilterContext?.filters.map((filter, index) =>
                      addFilterLocalIdentifier(filter, index),
                  ),
              }
            : updatedFilterContext;

        if (isTempFilterContext(originalFilterContext)) {
            throw new UnexpectedError("Cannot update temp filter context!");
        } else if (isFilterContextDefinition(sanitizedFilterContext)) {
            // Create a new filter context
            return this.createFilterContext(sanitizedFilterContext);
        } else if (isFilterContext(sanitizedFilterContext)) {
            // Update the current filter context
            const shouldUpdateFilterContext = !isEqual(originalFilterContext, sanitizedFilterContext);
            if (shouldUpdateFilterContext) {
                return this.updateFilterContext(sanitizedFilterContext);
            }
        }

        // No change, return the original filter context
        return originalFilterContext;
    };

    private updateFilterContext = async (filterContext: IFilterContext): Promise<IFilterContext> => {
        const userSettings = await getSettingsForCurrentUser(this.authCall, this.workspace);
        const useDateFilterLocalIdentifiers = userSettings.enableDateFilterIdentifiersRollout ?? true;

        const tigerFilterContext = convertFilterContextToBackend(
            filterContext,
            useDateFilterLocalIdentifiers,
        );
        const objectId = objRefToIdentifier(filterContext.ref, this.authCall);

        const result = await this.authCall((client) => {
            return FilterContextApi_UpdateEntityFilterContexts(
                client.axios,
                client.basePath,
                {
                    workspaceId: this.workspace,
                    objectId,
                    jsonApiFilterContextInDocument: {
                        data: {
                            id: objectId,
                            type: "filterContext",
                            attributes: {
                                content: tigerFilterContext,
                                title: filterContext.title || "",
                                description: filterContext.description || "",
                            },
                        },
                    },
                },
                {
                    headers: jsonApiHeaders,
                },
            );
        });

        return convertFilterContextFromBackend(result.data);
    };

    private getFilterContext = async (filterContextRef: ObjRef) => {
        const filterContextId = objRefToIdentifier(filterContextRef, this.authCall);
        const result = await this.authCall((client) => {
            return FilterContextApi_GetEntityFilterContexts(
                client.axios,
                client.basePath,
                {
                    workspaceId: this.workspace,
                    objectId: filterContextId,
                },
                {
                    headers: jsonApiHeaders,
                },
            );
        });

        return convertFilterContextFromBackend(result.data);
    };

    // prepare metadata and filter context with priority for given filter context options
    private prepareMetadata = async (
        exportId: string | undefined,
        type: "visual" | "slides" | undefined,
        filterContextRef: ObjRef | undefined,
        exportTabId?: string,
    ): Promise<{ filterContext?: IFilterContext; title?: string; hideWidgetTitles?: boolean }> => {
        const filterContextByRef = filterContextRef
            ? await this.getFilterContext(filterContextRef)
            : undefined;

        const filterContextByExport = exportId
            ? await this.getFilterContextByExportId(exportId, type, exportTabId)
            : undefined;

        return {
            filterContext: filterContextByExport?.filterContext || filterContextByRef,
            title: filterContextByExport?.title,
            hideWidgetTitles: filterContextByExport?.hideWidgetTitles,
        };
    };
}

type Writeable<T extends { [x: string]: any }, K extends string> = {
    [P in K]: T[P];
};

function updateDashboard(ds: IDashboard, title?: string, hideWidgetTitles?: boolean) {
    let dashboard = ds;

    // Rewrite dashboard title if it was set in the metadata
    if (title) {
        dashboard = {
            ...dashboard,
            title,
        };
    }

    // Hide widget titles if it was set in the metadata
    if (dashboard.layout && hideWidgetTitles) {
        walkLayout(dashboard.layout, {
            widgetCallback: (widget) => {
                if (isInsightWidget(widget)) {
                    const wd = widget as Writeable<IDashboardWidget, "configuration">;
                    wd.configuration = {
                        ...widget.configuration,
                        hideTitle: true,
                    };
                }
            },
        });
    }

    return dashboard;
}
