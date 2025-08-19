// (C) 2021-2025 GoodData Corporation
import { IWorkspaceUser } from "@gooddata/sdk-model";

import { DashboardContext } from "../../types/commonTypes.js";

export function loadWorkspaceUsers(ctx: DashboardContext): Promise<IWorkspaceUser[]> {
    const { backend, workspace } = ctx;

    return backend.workspace(workspace).users().queryAll();
}
