// (C) 2021-2025 GoodData Corporation
import { type RequestAsyncRender } from "../../commands/render.js";
import { asyncRenderRequested } from "../../events/render.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function requestAsyncRenderHandler(ctx: DashboardContext, cmd: RequestAsyncRender): any {
    const {
        payload: { id },
        correlationId,
    } = cmd;

    return asyncRenderRequested(id, ctx, correlationId);
}
