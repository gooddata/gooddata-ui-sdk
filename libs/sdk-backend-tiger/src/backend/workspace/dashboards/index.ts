// (C) 2020-2021 GoodData Corporation
import { isVisualizationObjectsItem, jsonApiHeaders } from "@gooddata/api-client-tiger";
import {
    IDashboard,
    IDashboardDefinition,
    IDashboardWithReferences,
    IFilterContext,
    IFilterContextDefinition,
    IListedDashboard,
    isFilterContextDefinition,
    IWorkspaceDashboardsService,
    NotSupported,
} from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import { v4 as uuidv4 } from "uuid";
import {
    convertAnalyticalDashboardToListItems,
    convertDashboard,
    convertFilterContextFromBackend,
    getFilterContextFromIncluded,
} from "../../../convertors/fromBackend/AnalyticalDashboardConverter";
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
        const result = await this.authCall((sdk) => {
            return sdk.workspaceModel.getEntitiesAnalyticalDashboards(
                {
                    workspaceId: this.workspace,
                },
                {
                    headers: jsonApiHeaders,
                },
            );
        });
        return convertAnalyticalDashboardToListItems(result.data);
    };

    public getDashboard = async (ref: ObjRef, filterContextRef?: ObjRef): Promise<IDashboard> => {
        const filterContextByRef = filterContextRef
            ? await this.getFilterContext(filterContextRef)
            : undefined;

        const id = await objRefToIdentifier(ref, this.authCall);
        const result = await this.authCall((sdk) => {
            return sdk.workspaceModel.getEntityAnalyticalDashboards(
                {
                    workspaceId: this.workspace,
                    id,
                },
                {
                    headers: jsonApiHeaders,
                    include: "filterContexts",
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
        const result = await this.authCall((sdk) => {
            return sdk.workspaceModel.getEntityAnalyticalDashboards(
                {
                    workspaceId: this.workspace,
                    id,
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
        const result = await this.authCall((sdk) => {
            return sdk.workspaceModel.createEntityAnalyticalDashboards(
                {
                    workspaceId: this.workspace,
                    jsonApiAnalyticalDashboardDocument: {
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

    public updateDashboard = async () => {
        throw new NotSupported("Not supported");
    };

    public deleteDashboard = async (ref: ObjRef): Promise<void> => {
        const id = await objRefToIdentifier(ref, this.authCall);

        await this.authCall((sdk) =>
            sdk.workspaceModel.deleteEntityAnalyticalDashboards(
                {
                    id: id,
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

        const result = await this.authCall((sdk) => {
            return sdk.workspaceModel.createEntityFilterContexts(
                {
                    workspaceId: this.workspace,
                    jsonApiFilterContextDocument: {
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

    private getFilterContext = async (filterContextRef: ObjRef) => {
        const filterContextId = await objRefToIdentifier(filterContextRef, this.authCall);
        const result = await this.authCall((sdk) => {
            return sdk.workspaceModel.getEntityFilterContexts(
                {
                    workspaceId: this.workspace,
                    id: filterContextId,
                },
                {
                    headers: jsonApiHeaders,
                },
            );
        });

        return convertFilterContextFromBackend(result.data);
    };
}
