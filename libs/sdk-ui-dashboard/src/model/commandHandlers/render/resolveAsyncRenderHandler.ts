// (C) 2021-2025 GoodData Corporation
import { ResolveAsyncRender } from "../../commands/render.js";
import { asyncRenderResolved } from "../../events/render.js";
import { DashboardContext } from "../../types/commonTypes.js";

export function resolveAsyncRenderHandler(ctx: DashboardContext, cmd: ResolveAsyncRender): any {
    const {
        payload: { id },
        correlationId,
    } = cmd;

    return asyncRenderResolved(id, ctx, correlationId);
}
