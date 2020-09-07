// (C) 2020 GoodData Corporation
import { IWorkspaceDashboards, IListedDashboard, NotSupported } from "@gooddata/sdk-backend-spi";
import { TigerAuthenticatedCallGuard } from "../../../types";
import { convertAnalyticalDashboardToListItems } from "../../../convertors/fromBackend/AnalyticalDashboardConverter";

export class TigerWorkspaceDashboards implements IWorkspaceDashboards {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    // Public methods

    public getDashboards = async (): Promise<IListedDashboard[]> => {
        const result = await this.authCall((sdk) => {
            return sdk.metadata.analyticalDashboardsGet({
                contentType: "application/json",
            });
        });
        return convertAnalyticalDashboardToListItems(result.data);
    };

    public getDashboard = async () => {
        throw new NotSupported("Not supported");
    };

    public createDashboard = async () => {
        throw new NotSupported("Not supported");
    };

    public updateDashboard = async () => {
        throw new NotSupported("Not supported");
    };

    public deleteDashboard = async () => {
        throw new NotSupported("Not supported");
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

    public bulkDeleteWidgetAlerts = async () => {
        throw new NotSupported("Not supported");
    };

    public getWidgetReferencedObjects = async () => {
        throw new NotSupported("Not supported");
    };
}
