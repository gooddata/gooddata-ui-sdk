// (C) 2020-2021 GoodData Corporation
import {
    AnalyticalDashboard,
    AnalyticalDashboards,
    FilterContext,
    isVisualizationObjectsItem,
} from "@gooddata/api-client-tiger";
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
import uuid4 from "uuid/v4";
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

const defaultHeaders = {
    Accept: "application/vnd.gooddata.api+json",
    "Content-Type": "application/vnd.gooddata.api+json",
};

export class TigerWorkspaceDashboards implements IWorkspaceDashboardsService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    // Public methods
    public getDashboards = async (): Promise<IListedDashboard[]> => {
        const result = await this.authCall((sdk) => {
            return sdk.workspaceModel.getEntities(
                {
                    entity: "analyticalDashboards",
                    workspaceId: this.workspace,
                },
                {
                    headers: { Accept: "application/vnd.gooddata.api+json" },
                },
            );
        });
        return convertAnalyticalDashboardToListItems(result.data as AnalyticalDashboards);
    };

    public getDashboard = async (ref: ObjRef, filterContextRef?: ObjRef): Promise<IDashboard> => {
        const filterContextByRef = filterContextRef
            ? await this.getFilterContext(filterContextRef)
            : undefined;

        const id = await objRefToIdentifier(ref, this.authCall);
        const result = await this.authCall((sdk) => {
            return sdk.workspaceModel.getEntity(
                {
                    entity: "analyticalDashboards",
                    workspaceId: this.workspace,
                    id,
                },
                {
                    headers: defaultHeaders,
                    include: "filterContexts",
                },
            );
        });

        const included = result.data.included || [];
        const filterContext = filterContextByRef
            ? filterContextByRef
            : getFilterContextFromIncluded(included);

        return convertDashboard(result.data as AnalyticalDashboard, filterContext);
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
            return sdk.workspaceModel.getEntity(
                {
                    entity: "analyticalDashboards",
                    workspaceId: this.workspace,
                    id,
                },
                {
                    headers: defaultHeaders,
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
            dashboard: convertDashboard(result.data as AnalyticalDashboard, filterContext),
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
            return sdk.workspaceModel.createEntity(
                {
                    entity: "analyticalDashboards",
                    workspaceId: this.workspace,
                    analyticsObject: {
                        data: {
                            id: uuid4(),
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
                    headers: defaultHeaders,
                },
            );
        });

        return convertDashboard(result.data as AnalyticalDashboard, filterContext);
    };

    public updateDashboard = async () => {
        throw new NotSupported("Not supported");
    };

    public deleteDashboard = async (ref: ObjRef): Promise<void> => {
        const id = await objRefToIdentifier(ref, this.authCall);

        await this.authCall((sdk) =>
            sdk.workspaceModel.deleteEntity(
                {
                    entity: "analyticalDashboards",
                    id: id,
                    workspaceId: this.workspace,
                },
                {
                    headers: defaultHeaders,
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
            return sdk.workspaceModel.createEntity(
                {
                    entity: "filterContexts",
                    workspaceId: this.workspace,
                    analyticsObject: {
                        data: {
                            id: uuid4(),
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
                    headers: defaultHeaders,
                },
            );
        });

        return convertFilterContextFromBackend(result.data as FilterContext);
    };

    private getFilterContext = async (filterContextRef: ObjRef) => {
        const filterContextId = await objRefToIdentifier(filterContextRef, this.authCall);
        const result = await this.authCall((sdk) => {
            return sdk.workspaceModel.getEntity(
                {
                    entity: "filterContexts",
                    workspaceId: this.workspace,
                    id: filterContextId,
                },
                {
                    headers: defaultHeaders,
                },
            );
        });

        return convertFilterContextFromBackend(result.data as FilterContext);
    };
}
