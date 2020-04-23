// (C) 2019-2020 GoodData Corporation
import {
    IWorkspaceDashboards,
    IDashboard,
    IDashboardDefinition,
    IListedDashboard,
    NotSupported,
} from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";

import { BearAuthenticatedCallGuard } from "../../../types";
import { convertListedDashboard } from "../../../toSdkModel/DashboardConverter";

export class BearWorkspaceDashboards implements IWorkspaceDashboards {
    constructor(private readonly authCall: BearAuthenticatedCallGuard, public readonly workspace: string) {}

    public async getDashboards(): Promise<IListedDashboard[]> {
        const dashboardsObjectLinks = await this.authCall(sdk =>
            sdk.md.getAnalyticalDashboards(this.workspace),
        );
        const dashboards = dashboardsObjectLinks.map(convertListedDashboard);
        return dashboards;
    }

    public async getDashboard(_dashboardRef: ObjRef, _filterContextRef?: ObjRef): Promise<IDashboard> {
        throw new NotSupported("not supported");
    }

    public async createDashboard(_dashboard: IDashboardDefinition): Promise<IDashboard> {
        throw new NotSupported("not supported");
    }

    public async updateDashboard(_dashboard: IDashboard, _updatedDashboard: IDashboard): Promise<IDashboard> {
        throw new NotSupported("not supported");
    }

    public async deleteDashboard(_dashboardRef: ObjRef): Promise<void> {
        throw new NotSupported("not supported");
    }
}
