// (C) 2020-2023 GoodData Corporation
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
    IExportBlobResult,
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
} from "@gooddata/sdk-model";
import isEqual from "lodash/isEqual.js";
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
import { resolveWidgetFilters } from "./widgetFilters.js";
import includes from "lodash/includes.js";
import { buildDashboardPermissions, TigerDashboardPermissionType } from "./dashboardPermissions.js";
import { convertExportMetadata as convertToBackendExportMetadata } from "../../../convertors/toBackend/ExportMetadataConverter.js";
import { convertExportMetadata as convertFromBackendExportMetadata } from "../../../convertors/fromBackend/ExportMetadataConverter.js";
import { parseNameFromContentDisposition } from "../../../utils/downloadFile.js";

const DEFAULT_POLL_DELAY = 5000;
const MAX_POLL_ATTEMPTS = 50;

export class TigerWorkspaceDashboards implements IWorkspaceDashboardsService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    // Public methods
    public getDashboards = async (options?: IGetDashboardOptions): Promise<IListedDashboard[]> => {
        if (options?.loadUserData) {
            console.warn(
                "Tiger backend does not support the 'loadUserData' option of getDashboards. Ignoring.",
            );
        }

        const result = await this.authCall((client) => {
            return MetadataUtilities.getAllPagesOf(
                client,
                client.entities.getAllEntitiesAnalyticalDashboards,
                { workspaceId: this.workspace, metaInclude: ["accessInfo"] },
                // TODO we need to show dashboards with invalid references now, later this should be rework or removed completely (related to NAS-140)
                // { headers: ValidateRelationsHeader },
            )
                .then(MetadataUtilities.mergeEntitiesResults)
                .then(MetadataUtilities.filterValidEntities);
        });

        return convertAnalyticalDashboardToListItems(result);
    };

    public getDashboard = async (
        ref: ObjRef,
        filterContextRef?: ObjRef,
        options?: IGetDashboardOptions,
    ): Promise<IDashboard> => {
        if (options?.loadUserData) {
            console.warn(
                "Tiger backend does not support the 'loadUserData' option of getDashboard. Ignoring.",
            );
        }

        const id = await objRefToIdentifier(ref, this.authCall);
        const result = await this.authCall((client) => {
            return client.entities.getEntityAnalyticalDashboards(
                {
                    workspaceId: this.workspace,
                    objectId: id,
                    include: ["filterContexts"],
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
        if (options?.loadUserData) {
            console.warn(
                "Tiger backend does not support the 'loadUserData' option of getDashboardWithReferences. Ignoring.",
            );
        }

        const dashboard = await this.getDashboardWithSideloads(ref, types);
        const included = dashboard.included || [];
        const insights = included.filter(isVisualizationObjectsItem).map(visualizationObjectsItemToInsight);
        const plugins = included
            .filter(isDashboardPluginsItem)
            .map(convertDashboardPluginWithLinksFromBackend);

        const filterContext = await this.prepareFilterContext(options?.exportId, filterContextRef, included);

        return {
            dashboard: convertDashboard(dashboard, filterContext),
            references: {
                insights,
                plugins,
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
                insights: included.filter(isVisualizationObjectsItem).map(visualizationObjectsItemToInsight),
                plugins: included
                    .filter(isDashboardPluginsItem)
                    .map(convertDashboardPluginWithLinksFromBackend),
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

        const { filters = [] } = convertFromBackendExportMetadata(metadata);
        return {
            filters,
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
    ): Promise<JsonApiAnalyticalDashboardOutDocument> => {
        const include: EntitiesApiGetEntityAnalyticalDashboardsRequest["include"] = ["filterContexts"];

        if (includes(types, "insight")) {
            include.push("visualizationObjects");
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

        const dashboardContent = convertAnalyticalDashboard(dashboard, filterContext?.ref);
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
        const dashboardContent = convertAnalyticalDashboard(updatedDashboard, filterContext?.ref);

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
    ): Promise<string> => {
        return this.exportDashboardToPdfBlob(dashboardRef, filters).then((result) => {
            URL.revokeObjectURL(result.objectUrl); // release blob memory as it will not be used
            return result.uri;
        });
    };

    public exportDashboardToPdfBlob = async (
        dashboardRef: ObjRef,
        filters?: FilterContextItem[],
    ): Promise<IExportBlobResult> => {
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
            const pdfExportRequest = {
                fileName: title,
                dashboardId,
                metadata: convertToBackendExportMetadata({ filters: withoutAllTime }),
            };
            const pdfExport = await client.export.createPdfExport({
                workspaceId: this.workspace,
                pdfExportRequest,
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
    ): Promise<IExportBlobResult> {
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

    public getResolvedFiltersForWidget = async (widget: IWidget, filters: IFilter[]): Promise<IFilter[]> => {
        return resolveWidgetFilters(filters, widget.ignoreDashboardFilters, widget.dateDataSet, (refs) =>
            objRefsToIdentifiers(refs, this.authCall),
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

    public getDashboardPlugin = async (ref: ObjRef): Promise<IDashboardPlugin> => {
        const objectId = await objRefToIdentifier(ref, this.authCall);
        const result = await this.authCall((client) => {
            return client.entities.getEntityDashboardPlugins(
                {
                    workspaceId: this.workspace,
                    objectId,
                },
                {
                    headers: jsonApiHeaders,
                },
            );
        });

        return convertDashboardPluginFromBackend(result.data);
    };

    public getDashboardPlugins = async (): Promise<IDashboardPlugin[]> => {
        const result = await this.authCall((client) => {
            return MetadataUtilities.getAllPagesOf(
                client,
                client.entities.getAllEntitiesDashboardPlugins,
                { workspaceId: this.workspace },
                { headers: ValidateRelationsHeader },
            )
                .then(MetadataUtilities.mergeEntitiesResults)
                .then(MetadataUtilities.filterValidEntities);
        });

        return result.data.map(convertDashboardPluginWithLinksFromBackend);
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
                    metaInclude: ["permissions"],
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
