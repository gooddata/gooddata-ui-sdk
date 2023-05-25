// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes.js";
import { ResolveAsyncRender } from "../../commands/render.js";
import { asyncRenderResolved } from "../../events/render.js";

export function resolveAsyncRenderHandler(ctx: DashboardContext, cmd: ResolveAsyncRender): any {
    const {
        payload: { id },
        correlationId,
    } = cmd;

    return asyncRenderResolved(id, ctx, correlationId);
}
