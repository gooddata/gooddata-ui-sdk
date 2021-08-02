// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes";
import { ResolveAsyncRender } from "../../commands/render";
import { asyncRenderResolved } from "../../events/render";

export function resolveAsyncRenderHandler(ctx: DashboardContext, cmd: ResolveAsyncRender): any {
    const {
        payload: { id },
        correlationId,
    } = cmd;

    return asyncRenderResolved(id, ctx, correlationId);
}
