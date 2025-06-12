// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes.js";
import { RequestAsyncRender } from "../../commands/render.js";
import { asyncRenderRequested } from "../../events/render.js";

export function requestAsyncRenderHandler(ctx: DashboardContext, cmd: RequestAsyncRender): any {
    const {
        payload: { id },
        correlationId,
    } = cmd;

    return asyncRenderRequested(id, ctx, correlationId);
}
