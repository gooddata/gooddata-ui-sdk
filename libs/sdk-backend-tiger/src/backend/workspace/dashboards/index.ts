// (C) 2020 GoodData Corporation
import {
    AnalyticalDashboard,
    AnalyticalDashboards,
    isVisualizationObjectsItem,
} from "@gooddata/api-client-tiger";
import {
    IDashboard,
    IDashboardDefinition,
    IDashboardWithReferences,
    IListedDashboard,
    IWorkspaceDashboardsService,
    NotSupported,
} from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import uuid4 from "uuid/v4";
import {
    convertAnalyticalDashboardToListItems,
    convertDashboard,
} from "../../../convertors/fromBackend/AnalyticalDashboardConverter";
import { visualizationObjectsItemToInsight } from "../../../convertors/fromBackend/InsightConverter";
import { convertAnalyticalDashboard } from "../../../convertors/toBackend/AnalyticalDashboardConverter";
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
        if (filterContextRef) {
            throw new NotSupported("Not supported property 'filterContextRef'");
        }

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
                },
            );
        });

        return convertDashboard(result.data as AnalyticalDashboard);
    };

    public getDashboardWithReferences = async (
        ref: ObjRef,
        filterContextRef?: ObjRef,
    ): Promise<IDashboardWithReferences> => {
        if (filterContextRef) {
            throw new NotSupported("Not supported property 'filterContextRef'");
        }

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
                        include: "visualizationObjects",
                    },
                },
            );
        });

        const included = result.data.included || [];

        return {
            dashboard: convertDashboard(result.data as AnalyticalDashboard),
            references: {
                insights: included.filter(isVisualizationObjectsItem).map(visualizationObjectsItemToInsight),
            },
        };
    };

    public createDashboard = async (dashboard: IDashboardDefinition): Promise<IDashboard> => {
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
                                content: convertAnalyticalDashboard(dashboard),
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

        return convertDashboard(result.data);
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
}
