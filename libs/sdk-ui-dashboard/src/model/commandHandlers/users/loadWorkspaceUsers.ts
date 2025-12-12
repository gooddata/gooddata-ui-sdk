// (C) 2021-2025 GoodData Corporation
import { type IWorkspaceUser } from "@gooddata/sdk-model";

import { type DashboardContext } from "../../types/commonTypes.js";

export function loadWorkspaceUsers({ backend, workspace }: DashboardContext): Promise<IWorkspaceUser[]> {
    return backend.workspace(workspace).users().queryAll();
}
