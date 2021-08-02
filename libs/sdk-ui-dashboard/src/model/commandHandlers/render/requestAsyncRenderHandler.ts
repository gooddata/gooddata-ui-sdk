// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes";
import { RequestAsyncRender } from "../../commands/render";
import { asyncRenderRequested } from "../../events/render";

export function requestAsyncRenderHandler(ctx: DashboardContext, cmd: RequestAsyncRender): any {
    const {
        payload: { id },
        correlationId,
    } = cmd;

    return asyncRenderRequested(id, ctx, correlationId);
}
