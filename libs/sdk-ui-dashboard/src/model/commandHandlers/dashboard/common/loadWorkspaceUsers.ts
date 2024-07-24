// (C) 2021-2024 GoodData Corporation
import { ISettings } from "@gooddata/sdk-model";
import { DashboardContext, Users } from "../../../types/commonTypes.js";

export function loadWorkspaceUsers(ctx: DashboardContext, settings: ISettings): Promise<Users> {
    const { backend, workspace } = ctx;

    if (!settings?.enableScheduling) {
        return Promise.resolve([]);
    }

    return backend.workspace(workspace).users().queryAll();
}
