// (C) 2020-2025 GoodData Corporation
import {
    EntitiesApiGetEntityAnalyticalDashboardsRequest,
    isDashboardPluginsItem,
    isVisualizationObjectsItem,
    JsonApiAnalyticalDashboardInTypeEnum,
    JsonApiAnalyticalDashboardOutDocument,
    JsonApiDashboardPluginInTypeEnum,
    JsonApiFilterContextInTypeEnum,
    jsonApiHeaders,
    MetadataUtilities,
    ValidateRelationsHeader,
    ITigerClient,
    JsonApiFilterViewOutDocument,
    isDataSetItem,
} from "@gooddata/api-client-tiger";
import {
    IDashboardReferences,
    IDashboardWithReferences,
    IGetDashboardOptions,
    IWorkspaceDashboardsService,
    NotSupported,
    SupportedDashboardReferenceTypes,
    UnexpectedError,
    TimeoutError,
    IExportResult,
    IGetDashboardPluginOptions,
    IDashboardsQuery,
} from "@gooddata/sdk-backend-spi";
import {
    areObjRefsEqual,
    IFilter,
    ObjRef,
    idRef,
    IFilterContext,
    IFilterContextDefinition,
    ITempFilterContext,
    isFilterContext,
    isFilterContextDefinition,
    isTempFilterContext,
    IWidget,
    IDashboard,
    IDashboardDefinition,
    IListedDashboard,
    IDashboardPlugin,
    IDashboardPluginDefinition,
    IDashboardPermissions,
    FilterContextItem,
    isAllTimeDashboardDateFilter,
    objRefToString,
    IDateFilter,
    IDashboardFilterView,
    IDashboardFilterViewSaveRequest,
    IDashboardAttributeFilterConfig,
} from "@gooddata/sdk-model";
import isEqual from "lodash/isEqual.js";
import { v4 as uuid } from "uuid";
import {
    convertAnalyticalDashboardToListItems,
    convertDashboard,
    convertFilterContextFromBackend,
    getFilterContextFromIncluded,
    convertDashboardPluginFromBackend,
    convertDashboardPluginWithLinksFromBackend,
} from "../../../convertors/fromBackend/analyticalDashboards/AnalyticalDashboardConverter.js";
import { visualizationObjectsItemToInsight } from "../../../convertors/fromBackend/InsightConverter.js";
import {
    convertAnalyticalDashboard,
    convertDashboardPluginToBackend,
    convertFilterContextToBackend,
} from "../../../convertors/toBackend/AnalyticalDashboardConverter.js";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { objRefsToIdentifiers, objRefToIdentifier } from "../../../utils/api.js";
import { resolveWidgetFilters, resolveWidgetFiltersWithMultipleDateFilters } from "./widgetFilters.js";
import includes from "lodash/includes.js";
import { buildDashboardPermissions, TigerDashboardPermissionType } from "./dashboardPermissions.js";
import { convertExportMetadata as convertToBackendExportMetadata } from "../../../convertors/toBackend/ExportMetadataConverter.js";
import { convertExportMetadata as convertFromBackendExportMetadata } from "../../../convertors/fromBackend/ExportMetadataConverter.js";
import { parseNameFromContentDisposition } from "../../../utils/downloadFile.js";
import { GET_OPTIMIZED_WORKSPACE_PARAMS } from "../constants.js";
import { DashboardsQuery } from "./dashboardsQuery.js";
import { getSettingsForCurrentUser } from "../settings/index.js";
import { convertFilterView } from "../../../convertors/fromBackend/FilterViewConvertor.js";
import { invariant } from "ts-invariant";
import { convertApiError } from "../../../utils/errorHandling.js";
import { convertDataSetItem } from "../../../convertors/fromBackend/DataSetConverter.js";

const DEFAULT_POLL_DELAY = 5000;
const MAX_POLL_ATTEMPTS = 50;

export class TigerWorkspaceDashboards implements IWorkspaceDashboardsService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    // Public methods
    public getDashboards = async (options?: IGetDashboardOptions): Promise<IListedDashboard[]> => {
        const includeUser = options?.loadUserData
            ? { include: ["createdBy" as const, "modifiedBy" as const] }
            : {};
        const result = await this.authCall((client) => {
            return MetadataUtilities.getAllPagesOf(
                client,
                client.entities.getAllEntitiesAnalyticalDashboards,
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
        const id = await objRefToIdentifier(ref, this.authCall);
        const result = await this.authCall((client) => {
            return client.entities.getEntityAnalyticalDashboards(
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

        const filterContext = await this.prepareFilterContext(
            options?.exportId,
            filterContextRef,
            result?.data?.included,
        );
        return convertDashboard(result.data, filterContext);
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

        const dataSets = included.filter(isDataSetItem).map(convertDataSetItem);

        const filterContext = await this.prepareFilterContext(options?.exportId, filterContextRef, included);

        return {
            dashboard: convertDashboard(dashboard, filterContext),
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
                dataSets: included.filter(isDataSetItem).map(convertDataSetItem),
            };
        });
    };

    private getFilterContextFromExportId = async (exportId: string): Promise<IFilterContext | null> => {
        const metadata = await this.authCall((client) => {
            return client.export.getMetadata({
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

        const convertedExportMetadata = convertFromBackendExportMetadata(metadata);

        // Fallback to default filters if no filters are present in the export metadata
        if (!convertedExportMetadata) {
            return null;
        }

        return {
            filters: convertedExportMetadata.filters,
            title: `temp-filter-context-${exportId}`,
            description: "temp-filter-context-description",
            ref: { identifier: `identifier-${exportId}` },
            uri: `uri-${exportId}`,
            identifier: `identifier-${exportId}`,
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

        if (includes(types, "insight")) {
            include.push("visualizationObjects");
        }

        if (includes(types, "dataSet")) {
            include.push("datasets");
        }

        if (includes(types, "dashboardPlugin")) {
            include.push("dashboardPlugins");
        }

        const id = await objRefToIdentifier(ref, this.authCall);

        return this.authCall((client) => {
            return client.entities.getEntityAnalyticalDashboards(
                {
                    workspaceId: this.workspace,
                    objectId: id,
                    include,
                    metaInclude: ["accessInfo"],
                },
                {
                    headers: jsonApiHeaders,
                },
            );
        }).then((result) => result.data);
    };

    public createDashboard = async (dashboard: IDashboardDefinition): Promise<IDashboard> => {
        let filterContext;
        if (dashboard.filterContext) {
            filterContext = isFilterContextDefinition(dashboard.filterContext)
                ? await this.createFilterContext(dashboard.filterContext)
                : dashboard.filterContext;
        }

        const userSettings = await getSettingsForCurrentUser(this.authCall, this.workspace);
        const isWidgetIdentifiersEnabled = userSettings.enableWidgetIdentifiersRollout ?? true;

        const dashboardContent = convertAnalyticalDashboard(
            dashboard,
            filterContext?.ref,
            isWidgetIdentifiersEnabled,
        );
        const result = await this.authCall((client) => {
            return client.entities.createEntityAnalyticalDashboards(
                {
                    workspaceId: this.workspace,
                    jsonApiAnalyticalDashboardPostOptionalIdDocument: {
                        data: {
                            type: JsonApiAnalyticalDashboardInTypeEnum.ANALYTICAL_DASHBOARD,
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

        const filterContext = await this.processFilterContextUpdate(
            originalDashboard.filterContext,
            updatedDashboard.filterContext,
        );

        const objectId = await objRefToIdentifier(originalDashboard.ref, this.authCall);
        const userSettings = await getSettingsForCurrentUser(this.authCall, this.workspace);
        const isWidgetIdentifiersEnabled = userSettings.enableWidgetIdentifiersRollout ?? true;
        const dashboardContent = convertAnalyticalDashboard(
            updatedDashboard,
            filterContext?.ref,
            isWidgetIdentifiersEnabled,
        );

        const result = await this.authCall((client) => {
            return client.entities.updateEntityAnalyticalDashboards(
                {
                    workspaceId: this.workspace,
                    objectId,
                    jsonApiAnalyticalDashboardInDocument: {
                        data: {
                            id: objectId,
                            type: JsonApiAnalyticalDashboardInTypeEnum.ANALYTICAL_DASHBOARD,
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

    public deleteDashboard = async (ref: ObjRef): Promise<void> => {
        const id = await objRefToIdentifier(ref, this.authCall);

        await this.authCall((client) =>
            client.entities.deleteEntityAnalyticalDashboards(
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
    ): Promise<IExportResult> => {
        const dashboardId = await objRefToIdentifier(dashboardRef, this.authCall);

        // skip all time date filter from stored filters, when missing, it's correctly
        // restored to All time during the load later
        const withoutAllTime = (filters || []).filter((f) => !isAllTimeDashboardDateFilter(f));

        return this.authCall(async (client) => {
            const dashboardResponse = await client.entities.getEntityAnalyticalDashboards(
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
                fileName: title,
                dashboardId,
                metadata: convertToBackendExportMetadata({ filters: withoutAllTime }),
            };
            const pdfExport = await client.export.createPdfExport({
                workspaceId: this.workspace,
                visualExportRequest,
            });

            return await this.handleExportResultPolling(client, {
                workspaceId: this.workspace,
                exportId: pdfExport?.data?.exportResult,
            });
        });
    };

    private async handleExportResultPolling(
        client: ITigerClient,
        payload: { exportId: string; workspaceId: string },
    ): Promise<IExportResult> {
        for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
            const result = await client.export.getExportedFile(payload, {
                transformResponse: (x) => x,
                responseType: "blob",
            });

            if (result?.status === 200) {
                const blob = new Blob([result?.data as any], { type: "application/pdf" });
                return {
                    uri: result?.config?.url || "",
                    objectUrl: URL.createObjectURL(blob),
                    fileName: parseNameFromContentDisposition(result),
                };
            }

            await new Promise((resolve) => setTimeout(resolve, DEFAULT_POLL_DELAY));
        }

        throw new TimeoutError(
            `Export timeout for export id "${payload.exportId}" in workspace "${payload.workspaceId}"`,
        );
    }

    public createScheduledMail = async () => {
        throw new NotSupported("Tiger backend does not support scheduled emails.");
    };

    public updateScheduledMail = async () => {
        throw new NotSupported("Tiger backend does not support scheduled emails.");
    };

    public deleteScheduledMail = async () => {
        throw new NotSupported("Tiger backend does not support scheduled emails.");
    };

    public getScheduledMailsForDashboard = async () => {
        throw new NotSupported("Tiger backend does not support scheduled emails.");
    };

    public getScheduledMailsCountForDashboard = async () => {
        // FIXME Not supported
        return 0;
    };

    public getAllWidgetAlertsForCurrentUser = async () => {
        // FIXME Not supported
        return [];
    };

    public getDashboardWidgetAlertsForCurrentUser = async () => {
        throw new NotSupported("Tiger backend does not support alerting.");
    };

    public getWidgetAlertsCountForWidgets = async () => {
        // FIXME Not supported
        return [];
    };

    public createWidgetAlert = async () => {
        throw new NotSupported("Tiger backend does not support alerting.");
    };

    public updateWidgetAlert = async () => {
        throw new NotSupported("Tiger backend does not support alerting.");
    };

    public deleteWidgetAlert = async () => {
        throw new NotSupported("Tiger backend does not support alerting.");
    };

    public deleteWidgetAlerts = async () => {
        throw new NotSupported("Tiger backend does not support alerting.");
    };

    public getWidgetReferencedObjects = async () => {
        throw new NotSupported("Tiger backend does not support alerting.");
    };

    public getResolvedFiltersForWidget = async (
        widget: IWidget,
        filters: IFilter[],
        attributeFilterConfigs: IDashboardAttributeFilterConfig[],
    ): Promise<IFilter[]> => {
        return resolveWidgetFilters(
            filters,
            widget.ignoreDashboardFilters,
            widget.dateDataSet,
            (refs) => objRefsToIdentifiers(refs, this.authCall),
            attributeFilterConfigs,
        );
    };

    public getResolvedFiltersForWidgetWithMultipleDateFilters = async (
        widget: IWidget,
        commonDateFilters: IDateFilter[],
        otherFilters: IFilter[],
        attributeFilterConfigs: IDashboardAttributeFilterConfig[],
    ): Promise<IFilter[]> => {
        return resolveWidgetFiltersWithMultipleDateFilters(
            commonDateFilters,
            otherFilters,
            widget.ignoreDashboardFilters,
            widget.dateDataSet,
            (refs) => objRefsToIdentifiers(refs, this.authCall),
            attributeFilterConfigs,
        );
    };

    public createDashboardPlugin = async (plugin: IDashboardPluginDefinition): Promise<IDashboardPlugin> => {
        const pluginContent = convertDashboardPluginToBackend(plugin);

        const result = await this.authCall((client) => {
            return client.entities.createEntityDashboardPlugins(
                {
                    workspaceId: this.workspace,
                    jsonApiDashboardPluginPostOptionalIdDocument: {
                        data: {
                            type: JsonApiDashboardPluginInTypeEnum.DASHBOARD_PLUGIN,
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
        const id = await objRefToIdentifier(ref, this.authCall);

        await this.authCall((client) =>
            client.entities.deleteEntityDashboardPlugins(
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
        const objectId = await objRefToIdentifier(ref, this.authCall);
        const result = await this.authCall((client) => {
            return client.entities.getEntityDashboardPlugins(
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
                client.entities.getAllEntitiesDashboardPlugins,
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
            client.actions
                .getDependentEntitiesGraph({
                    workspaceId: this.workspace,
                })
                .then((res) => res.data.graph),
        );
        const analyticalDashboards = entitiesGraph.nodes.filter(({ type }) => type === "analyticalDashboard");

        // Refs which are not listed in entities graph are non-existent
        const validDashboardRefs = dashboardRefs.filter((ref) => {
            const dashboardId = objRefToString(ref);
            return analyticalDashboards.some(({ id }) => id === dashboardId);
        });

        return validDashboardRefs.map((ref) => ({
            ref,
            identifier: objRefToString(ref),
            uri: "", // uri is not available in entities graph
        }));
    };

    public getFilterViewsForCurrentUser = async (dashboard: ObjRef): Promise<IDashboardFilterView[]> => {
        try {
            const dashboardId = await objRefToIdentifier(dashboard, this.authCall);
            const result = await this.authCall(async (client) => {
                const profile = await client.profile.getCurrent();
                return client.entities.getAllEntitiesFilterViews({
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
            const { name, dashboard, isDefault, filterContext } = filterView;

            const dashboardId = await objRefToIdentifier(dashboard, this.authCall);

            return this.authCall(async (client) => {
                if (isDefault) {
                    // this should ideally be handled by the POST call below so all these calls are just
                    // a single transaction and the action itself is more performant on UI
                    await this.unsetDashboardDefaultFilterView(client, dashboardId);
                }
                const profile = await client.profile.getCurrent();
                const result = await client.entities.createEntityFilterViews(
                    {
                        workspaceId: this.workspace,
                        jsonApiFilterViewInDocument: {
                            data: {
                                type: "filterView",
                                id: uuid(),
                                attributes: {
                                    isDefault,
                                    title: name,
                                    content: convertFilterContextToBackend(filterContext),
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
            const id = await objRefToIdentifier(ref, this.authCall);
            await this.authCall((client) =>
                client.entities.deleteEntityFilterViews({
                    workspaceId: this.workspace,
                    objectId: id,
                }),
            );
        } catch (error: any) {
            throw convertApiError(error);
        }
    };

    public setFilterViewAsDefault = async (ref: ObjRef, isDefault: boolean): Promise<void> => {
        const id = await objRefToIdentifier(ref, this.authCall);
        await this.authCall(async (client) => {
            if (isDefault) {
                // this should ideally be handled by the PATCH call below so all these calls are just
                // a single transaction and the action itself is more performant on UI
                const filterView = await this.getFilterView(client, id);
                const dashboardId = filterView.data.relationships?.analyticalDashboard?.data?.id;
                invariant(dashboardId, "Dashboard could not be determined for the filter view.");
                await this.unsetDashboardDefaultFilterView(client, dashboardId);
            }
            await this.updateFilterViewDefaultStatus(client, id, isDefault);
        });
    };

    private unsetDashboardDefaultFilterView = async (
        client: ITigerClient,
        dashboardId: string,
    ): Promise<void> => {
        const profile = await client.profile.getCurrent();
        const defaultFilterViewsForDashboard = await client.entities.getAllEntitiesFilterViews({
            workspaceId: this.workspace,
            include: ["user", "analyticalDashboard"],
            filter: `analyticalDashboard.id==${dashboardId};user.id==${profile.userId};filterView.isDefault==true`,
            origin: "NATIVE",
        });
        await Promise.all(
            defaultFilterViewsForDashboard.data.data.map((view) =>
                this.updateFilterViewDefaultStatus(client, view.id, false),
            ),
        );
    };

    private updateFilterViewDefaultStatus = async (
        client: ITigerClient,
        id: string,
        isDefault: boolean,
    ): Promise<void> => {
        await client.entities.patchEntityFilterViews({
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
        client: ITigerClient,
        id: string,
    ): Promise<JsonApiFilterViewOutDocument> => {
        return client.entities
            .getEntityFilterViews({
                workspaceId: this.workspace,
                objectId: id,
                include: ["analyticalDashboard"],
            })
            .then((result) => result.data);
    };

    //
    //
    //

    private createFilterContext = async (
        filterContext: IFilterContextDefinition,
    ): Promise<IFilterContext> => {
        const tigerFilterContext = convertFilterContextToBackend(filterContext);

        const result = await this.authCall((client) => {
            return client.entities.createEntityFilterContexts(
                {
                    workspaceId: this.workspace,
                    jsonApiFilterContextPostOptionalIdDocument: {
                        data: {
                            type: JsonApiFilterContextInTypeEnum.FILTER_CONTEXT,
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
                return client.entities.getEntityWorkspaces({
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

            const dashboardObjectId = await objRefToIdentifier(ref, this.authCall);
            const dashboardWithPermissionsResponse = await this.authCall((client) => {
                return client.entities.getEntityAnalyticalDashboards({
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

    private processFilterContextUpdate = async (
        originalFilterContext: IFilterContext | ITempFilterContext | undefined,
        updatedFilterContext: IFilterContext | ITempFilterContext | IFilterContextDefinition | undefined,
    ): Promise<IFilterContext | undefined> => {
        if (isTempFilterContext(originalFilterContext)) {
            throw new UnexpectedError("Cannot update temp filter context!");
        } else if (isFilterContextDefinition(updatedFilterContext)) {
            // Create a new filter context
            return this.createFilterContext(updatedFilterContext);
        } else if (isFilterContext(updatedFilterContext)) {
            // Update the current filter context
            const shouldUpdateFilterContext = !isEqual(originalFilterContext, updatedFilterContext);
            if (shouldUpdateFilterContext) {
                return this.updateFilterContext(updatedFilterContext);
            }
        }

        // No change, return the original filter context
        return originalFilterContext;
    };

    private updateFilterContext = async (filterContext: IFilterContext): Promise<IFilterContext> => {
        const tigerFilterContext = convertFilterContextToBackend(filterContext);
        const objectId = await objRefToIdentifier(filterContext.ref, this.authCall);

        const result = await this.authCall((client) => {
            return client.entities.updateEntityFilterContexts(
                {
                    workspaceId: this.workspace,
                    objectId,
                    jsonApiFilterContextInDocument: {
                        data: {
                            id: objectId,
                            type: JsonApiFilterContextInTypeEnum.FILTER_CONTEXT,
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
        const filterContextId = await objRefToIdentifier(filterContextRef, this.authCall);
        const result = await this.authCall((client) => {
            return client.entities.getEntityFilterContexts(
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

    // prepare filter context with priority for given filtercontext options
    private prepareFilterContext = async (
        exportId: string | undefined,
        filterContextRef: ObjRef | undefined,
        includedFilterContext: JsonApiAnalyticalDashboardOutDocument["included"] = [],
    ): Promise<IFilterContext | undefined> => {
        const filterContextByRef = filterContextRef
            ? await this.getFilterContext(filterContextRef)
            : undefined;

        const filterContextByExportId = exportId
            ? await this.getFilterContextFromExportId(exportId)
            : undefined;

        return (
            filterContextByExportId ||
            filterContextByRef ||
            getFilterContextFromIncluded(includedFilterContext)
        );
    };
}
