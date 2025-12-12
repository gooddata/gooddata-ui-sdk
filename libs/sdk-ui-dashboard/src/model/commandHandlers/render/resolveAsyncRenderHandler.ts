// (C) 2021-2025 GoodData Corporation
import { type ResolveAsyncRender } from "../../commands/render.js";
import { asyncRenderResolved } from "../../events/render.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function resolveAsyncRenderHandler(ctx: DashboardContext, cmd: ResolveAsyncRender): any {
    const {
        payload: { id },
        correlationId,
    } = cmd;

    return asyncRenderResolved(id, ctx, correlationId);
}
