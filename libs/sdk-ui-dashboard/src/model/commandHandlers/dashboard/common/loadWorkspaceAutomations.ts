// (C) 2021-2024 GoodData Corporation
import { IAutomationMetadataObject, ISettings } from "@gooddata/sdk-model";
import { DashboardContext, Automations } from "../../../types/commonTypes.js";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

export function loadWorkspaceAutomations(
    ctx: DashboardContext,
    settings: ISettings,
): Promise<IAutomationMetadataObject[]> {
    const { backend, workspace } = ctx;

    if (!settings?.enableScheduling) {
        return Promise.resolve([]);
    }

    return backend
        .workspace(workspace)
        .automations()
        .getAutomationsQuery()
        .withAll()
        .query()
        .then((result) => result.items);
}

export function loadContextAutomations(
    backend: IAnalyticalBackend,
    workspace: string,
    settings: ISettings,
    opts: {
        author?: string;
        dashboardId?: string;
    },
): Promise<Automations> {
    if (!settings?.enableScheduling) {
        return Promise.resolve([]);
    }

    return backend
        .workspace(workspace)
        .automations()
        .getAutomationsQuery()
        .withAll()
        .withDashboard(opts.dashboardId ?? "")
        .withAuthor(opts.author ?? "")
        .withSorting(["title,asc"])
        .query()
        .then((result) => result.items);
}
