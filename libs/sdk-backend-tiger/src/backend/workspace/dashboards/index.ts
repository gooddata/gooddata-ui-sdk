// (C) 2020 GoodData Corporation
import {
    AnalyticalDashboard,
    AnalyticalDashboardPostResourceTypeEnum,
    AnalyticalDashboards,
} from "@gooddata/api-client-tiger";
import {
    IDashboard,
    IDashboardDefinition,
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
import { convertAnalyticalDashboard } from "../../../convertors/toBackend/AnalyticalDashboardConverter";
import { TigerAuthenticatedCallGuard } from "../../../types";
import { objRefToIdentifier } from "../../../utils/api";

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
        const id = await objRefToIdentifier(ref, this.authCall);

        const result = await this.authCall((sdk) => {
            return sdk.workspaceModel.getEntity(
                {
                    entity: "analyticalDashboards",
                    workspaceId: this.workspace,
                    id,
                },
                {
                    headers: {
                        Accept: "application/vnd.gooddata.api+json",
                        "Content-Type": "application/vnd.gooddata.api+json",
                    },
                },
            );
        });

        if (filterContextRef) {
            throw new NotSupported("Not supported property 'filterContextRef'");
        }

        return convertDashboard(result.data as AnalyticalDashboard);
    };

    public createDashboard = async (dashboard: IDashboardDefinition) => {
        const result = await this.authCall((sdk) => {
            return sdk.workspaceModel.createEntity(
                {
                    entity: "analyticalDashboards",
                    workspaceId: this.workspace,
                    analyticsObject: {
                        data: {
                            id: uuid4(),
                            type: AnalyticalDashboardPostResourceTypeEnum.AnalyticalDashboard,
                            attributes: {
                                content: convertAnalyticalDashboard(dashboard),
                                title: dashboard.title,
                                description: dashboard.description || "",
                            },
                        },
                    },
                },
                {
                    headers: {
                        Accept: "application/vnd.gooddata.api+json",
                        "Content-Type": "application/vnd.gooddata.api+json",
                    },
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
            sdk.workspaceModel.deleteEntity({
                entity: "analyticalDashboards",
                id: id,
                workspaceId: this.workspace,
            }),
        );
    };

    public exportDashboardToPdf = async () => {
        throw new NotSupported("Not supported");
    };

    public createScheduledMail = async () => {
        throw new NotSupported("Not supported");
    };

    public getScheduledMailsCountForDashboard = async () => {
        throw new NotSupported("Not supported");
    };

    public getAllWidgetAlertsForCurrentUser = async () => {
        // FIXME Not supported
        return [];
    };

    public getDashboardWidgetAlertsForCurrentUser = async () => {
        throw new NotSupported("Not supported");
    };

    public getWidgetAlertsCountForWidgets = async () => {
        throw new NotSupported("Not supported");
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
