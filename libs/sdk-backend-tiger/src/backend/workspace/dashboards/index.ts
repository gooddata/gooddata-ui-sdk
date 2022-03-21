// (C) 2020-2022 GoodData Corporation
import {
    isDashboardPluginsItem,
    isVisualizationObjectsItem,
    JsonApiAnalyticalDashboardInTypeEnum,
    JsonApiAnalyticalDashboardOutDocument,
    JsonApiDashboardPluginInTypeEnum,
    JsonApiFilterContextInTypeEnum,
    jsonApiHeaders,
    MetadataUtilities,
    ValidateRelationsHeader,
} from "@gooddata/api-client-tiger";
import {
    IDashboard,
    IDashboardDefinition,
    IDashboardPlugin,
    IDashboardPluginDefinition,
    IDashboardReferences,
    IDashboardWithReferences,
    IFilterContext,
    IFilterContextDefinition,
    IGetDashboardOptions,
    IListedDashboard,
    isFilterContext,
    isFilterContextDefinition,
    isTempFilterContext,
    ITempFilterContext,
    IWidget,
    IWorkspaceDashboardsService,
    NotSupported,
    SupportedDashboardReferenceTypes,
    UnexpectedError,
} from "@gooddata/sdk-backend-spi";
import { areObjRefsEqual, IFilter, ObjRef } from "@gooddata/sdk-model";
import isEqual from "lodash/isEqual";
import { v4 as uuidv4 } from "uuid";
import {
    convertAnalyticalDashboardToListItems,
    convertDashboard,
    convertFilterContextFromBackend,
    getFilterContextFromIncluded,
    convertDashboardPluginFromBackend,
    convertDashboardPluginWithLinksFromBackend,
} from "../../../convertors/fromBackend/analyticalDashboards/AnalyticalDashboardConverter";
import { visualizationObjectsItemToInsight } from "../../../convertors/fromBackend/InsightConverter";
import {
    convertAnalyticalDashboard,
    convertDashboardPluginToBackend,
    convertFilterContextToBackend,
} from "../../../convertors/toBackend/AnalyticalDashboardConverter";
import { TigerAuthenticatedCallGuard } from "../../../types";
import { objRefsToIdentifiers, objRefToIdentifier } from "../../../utils/api";
import { resolveWidgetFilters } from "./widgetFilters";
import includes from "lodash/includes";

export class TigerWorkspaceDashboards implements IWorkspaceDashboardsService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    // Public methods
    public getDashboards = async (options?: IGetDashboardOptions): Promise<IListedDashboard[]> => {
        if (options?.loadUserData) {
            // eslint-disable-next-line no-console
            console.warn(
                "Tiger backend does not support the 'loadUserData' option of getDashboards. Ignoring.",
            );
        }

        const result = await this.authCall((client) => {
            return MetadataUtilities.getAllPagesOf(
                client,
                client.entities.getAllEntitiesAnalyticalDashboards,
                { workspaceId: this.workspace },
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
            // eslint-disable-next-line no-console
            console.warn(
                "Tiger backend does not support the 'loadUserData' option of getDashboard. Ignoring.",
            );
        }

        const filterContextByRef = filterContextRef
            ? await this.getFilterContext(filterContextRef)
            : undefined;

        const id = await objRefToIdentifier(ref, this.authCall);
        const result = await this.authCall((client) => {
            return client.entities.getEntityAnalyticalDashboards(
                {
                    workspaceId: this.workspace,
                    objectId: id,
                },
                {
                    headers: jsonApiHeaders,
                    params: {
                        include: "filterContexts",
                    },
                },
            );
        });

        const included = result.data.included || [];
        const filterContext = filterContextByRef
            ? filterContextByRef
            : getFilterContextFromIncluded(included);

        return convertDashboard(result.data, filterContext);
    };

    public getDashboardWithReferences = async (
        ref: ObjRef,
        filterContextRef?: ObjRef,
        options?: IGetDashboardOptions,
        types: SupportedDashboardReferenceTypes[] = ["insight", "dashboardPlugin"],
    ): Promise<IDashboardWithReferences> => {
        if (options?.loadUserData) {
            // eslint-disable-next-line no-console
            console.warn(
                "Tiger backend does not support the 'loadUserData' option of getDashboardWithReferences. Ignoring.",
            );
        }

        const filterContextByRef = filterContextRef
            ? await this.getFilterContext(filterContextRef)
            : undefined;

        const dashboard = await this.getDashboardWithSideloads(ref, types);
        const included = dashboard.included || [];
        const insights = included.filter(isVisualizationObjectsItem).map(visualizationObjectsItemToInsight);
        const plugins = included
            .filter(isDashboardPluginsItem)
            .map(convertDashboardPluginWithLinksFromBackend);
        const filterContext = filterContextByRef
            ? filterContextByRef
            : getFilterContextFromIncluded(included);

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

    private getDashboardWithSideloads = async (
        ref: ObjRef,
        types: SupportedDashboardReferenceTypes[],
    ): Promise<JsonApiAnalyticalDashboardOutDocument> => {
        const include = ["filterContexts"];

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
                },
                {
                    headers: jsonApiHeaders,
                    params: {
                        include: include.join(","),
                    },
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
                    jsonApiAnalyticalDashboardInDocument: {
                        data: {
                            id: uuidv4(),
                            type: JsonApiAnalyticalDashboardInTypeEnum.AnalyticalDashboard,
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

        return convertDashboard(result.data, filterContext);
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
                            type: JsonApiAnalyticalDashboardInTypeEnum.AnalyticalDashboard,
                            attributes: {
                                content: dashboardContent,
                                title: updatedDashboard.title,
                                description: updatedDashboard.description || "",
                            },
                        },
                    },
                },
                {
                    headers: jsonApiHeaders,
                },
            );
        });

        return convertDashboard(result.data, filterContext);
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

    public exportDashboardToPdf = async () => {
        throw new NotSupported("Tiger backend does not support export to PDF.");
    };

    public createScheduledMail = async () => {
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
                    jsonApiDashboardPluginInDocument: {
                        data: {
                            id: uuidv4(),
                            type: JsonApiDashboardPluginInTypeEnum.DashboardPlugin,
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
                    jsonApiFilterContextInDocument: {
                        data: {
                            id: uuidv4(),
                            type: JsonApiFilterContextInTypeEnum.FilterContext,
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
                            type: JsonApiFilterContextInTypeEnum.FilterContext,
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
}
