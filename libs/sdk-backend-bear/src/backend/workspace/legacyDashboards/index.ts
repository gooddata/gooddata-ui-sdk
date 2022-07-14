// (C) 2022 GoodData Corporation
import { IWorkspaceLegacyDashboardsService } from "@gooddata/sdk-backend-spi";
import { ILegacyDashboard } from "@gooddata/sdk-model";

import { BearAuthenticatedCallGuard } from "../../../types/auth";

import { projectDashboardToLegacyDashboard } from "./convertors";

export class BearWorkspaceLegacyDashboards implements IWorkspaceLegacyDashboardsService {
    constructor(private readonly authCall: BearAuthenticatedCallGuard, public readonly workspace: string) {}

    public getLegacyDashboards = async (): Promise<ILegacyDashboard[]> => {
        const data = await this.authCall((sdk) => sdk.md.getProjectDashboards(this.workspace));
        return projectDashboardToLegacyDashboard(data);
    };
}
