// (C) 2021-2024 GoodData Corporation
import { ISettings } from "@gooddata/sdk-model";
import { DashboardContext, Automations } from "../../../types/commonTypes.js";

export function loadWorkspaceAutomations(
    ctx: DashboardContext,
    settings: ISettings,
    limit = 100,
): Promise<Automations> {
    const { backend, workspace } = ctx;

    if (!settings?.enableScheduling) {
        return Promise.resolve([]);
    }

    return backend
        .workspace(workspace)
        .automations()
        .getAutomationsQuery()
        .withSize(limit)
        .withSorting(["title,asc"])
        .query()
        .then((result) => result.items);
}
