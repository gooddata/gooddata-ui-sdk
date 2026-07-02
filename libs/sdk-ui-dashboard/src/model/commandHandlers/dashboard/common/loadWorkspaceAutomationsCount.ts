// (C) 2021-2026 GoodData Corporation

import { NotSupported } from "@gooddata/sdk-backend-spi";

import { type DashboardContext } from "../../../types/commonTypes.js";

export async function loadWorkspaceAutomationsCount(ctx: DashboardContext): Promise<number> {
    const { backend, workspace } = ctx;

    if (ctx.config?.isReadOnly || ctx.config?.isExport || ctx.config?.initialRenderMode === "export") {
        return Promise.resolve(0);
    }

    try {
        const result = await backend
            .workspace(workspace)
            .automations()
            .getAutomationsQuery()
            .withSize(1)
            .query();

        return result.totalCount ?? 0;
    } catch (e) {
        if (e instanceof NotSupported) {
            return 0;
        }

        throw e;
    }
}
