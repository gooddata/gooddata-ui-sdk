// (C) 2020-2021 GoodData Corporation
import { isVisualizationObjectsItem, jsonApiHeaders, MetadataUtilities } from "@gooddata/api-client-tiger";
import {
    IDashboard,
    IDashboardDefinition,
    IDashboardWithReferences,
    IFilterContext,
    IFilterContextDefinition,
    IListedDashboard,
    isFilterContext,
    isFilterContextDefinition,
    isTempFilterContext,
    ITempFilterContext,
    IWorkspaceDashboardsService,
    NotSupported,
    UnexpectedError,
} from "@gooddata/sdk-backend-spi";
import { areObjRefsEqual, ObjRef } from "@gooddata/sdk-model";
import isEqual from "lodash/isEqual";
import { v4 as uuidv4 } from "uuid";
import {
    convertAnalyticalDashboardToListItems,
    convertDashboard,
    convertFilterContextFromBackend,
    getFilterContextFromIncluded,
} from "../../../convertors/fromBackend/analyticalDashboards/AnalyticalDashboardConverter";
import { visualizationObjectsItemToInsight } from "../../../convertors/fromBackend/InsightConverter";
import {
    convertAnalyticalDashboard,
    convertFilterContextToBackend,
} from "../../../convertors/toBackend/AnalyticalDashboardConverter";
import { TigerAuthenticatedCallGuard } from "../../../types";
import { objRefToIdentifier } from "../../../utils/api";

export class TigerWorkspaceDashboards implements IWorkspaceDashboardsService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    // Public methods
    public getDashboards = async (): Promise<IListedDashboard[]> => {
        const result = await this.authCall((client) => {
            return MetadataUtilities.getAllPagesOf(
                client,
                client.workspaceObjects.getEntitiesAnalyticalDashboards,
                { workspaceId: this.workspace },
            ).then(MetadataUtilities.mergeEntitiesResults);
        });

        return convertAnalyticalDashboardToListItems(result);
    };

    public getDashboard = async (ref: ObjRef, filterContextRef?: ObjRef): Promise<IDashboard> => {
        const filterContextByRef = filterContextRef
            ? await this.getFilterContext(filterContextRef)
            : undefined;

        const id = await objRefToIdentifier(ref, this.authCall);
        const result = await this.authCall((client) => {
            return client.workspaceObjects.getEntityAnalyticalDashboards(
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
    ): Promise<IDashboardWithReferences> => {
        const filterContextByRef = filterContextRef
            ? await this.getFilterContext(filterContextRef)
            : undefined;

        const id = await objRefToIdentifier(ref, this.authCall);
        const result = await this.authCall((client) => {
            return client.workspaceObjects.getEntityAnalyticalDashboards(
                {
                    workspaceId: this.workspace,
                    objectId: id,
                },
                {
                    headers: jsonApiHeaders,
                    params: {
                        include: "visualizationObjects,filterContexts",
                    },
                },
            );
        });

        const included = result.data.included || [];
        const insights = included.filter(isVisualizationObjectsItem).map(visualizationObjectsItemToInsight);
        const filterContext = filterContextByRef
            ? filterContextByRef
            : getFilterContextFromIncluded(included);

        return {
            dashboard: convertDashboard(result.data, filterContext),
            references: {
                insights,
            },
        };
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
            return client.workspaceObjects.createEntityAnalyticalDashboards(
                {
                    workspaceId: this.workspace,
                    jsonApiAnalyticalDashboardInDocument: {
                        data: {
                            id: uuidv4(),
                            type: "analyticalDashboard",
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
            return client.workspaceObjects.updateEntityAnalyticalDashboards(
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
            client.workspaceObjects.deleteEntityAnalyticalDashboards(
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
        throw new NotSupported("Not supported");
    };

    public createScheduledMail = async () => {
        throw new NotSupported("Not supported");
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
        throw new NotSupported("Not supported");
    };

    public getWidgetAlertsCountForWidgets = async () => {
        // FIXME Not supported
        return [];
    };

    public createWidgetAlert = async () => {
        throw new NotSupported("Not supported");
    };

    public updateWidgetAlert = async () => {
        throw new NotSupported("Not supported");
    };

    public deleteWidgetAlert = async () => {
        throw new NotSupported("Not supported");
    };

    public deleteWidgetAlerts = async () => {
        throw new NotSupported("Not supported");
    };

    public getWidgetReferencedObjects = async () => {
        throw new NotSupported("Not supported");
    };

    public getResolvedFiltersForWidget = async () => {
        throw new NotSupported("Not supported");
    };

    private createFilterContext = async (
        filterContext: IFilterContextDefinition,
    ): Promise<IFilterContext> => {
        const tigerFilterContext = convertFilterContextToBackend(filterContext);

        const result = await this.authCall((client) => {
            return client.workspaceObjects.createEntityFilterContexts(
                {
                    workspaceId: this.workspace,
                    jsonApiFilterContextInDocument: {
                        data: {
                            id: uuidv4(),
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
            return client.workspaceObjects.updateEntityFilterContexts(
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
        const filterContextId = await objRefToIdentifier(filterContextRef, this.authCall);
        const result = await this.authCall((client) => {
            return client.workspaceObjects.getEntityFilterContexts(
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
