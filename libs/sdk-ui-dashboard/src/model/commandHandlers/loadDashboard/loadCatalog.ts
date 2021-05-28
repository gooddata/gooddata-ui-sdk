// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes";
import { IWorkspaceCatalog } from "@gooddata/sdk-backend-spi";

export function loadCatalog(ctx: DashboardContext): Promise<IWorkspaceCatalog> {
    const { backend, workspace } = ctx;

    return backend.workspace(workspace).catalog().load();
}
