// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes";
import { internalErrorOccurred } from "../../events/general";
import { RequestAsyncRender } from "../../commands/render";
import { asyncRenderRequested } from "../../events/render";

export function requestAsyncRenderHandler(ctx: DashboardContext, cmd: RequestAsyncRender): any {
    // eslint-disable-next-line no-console
    console.debug("handling request async render", cmd, "in context", ctx);

    try {
        const {
            payload: { id },
            correlationId,
        } = cmd;

        return asyncRenderRequested(id, ctx, correlationId);
    } catch (e) {
        throw internalErrorOccurred(
            ctx,
            "An unexpected error has occurred while requesting async rendering",
            e,
            cmd.correlationId,
        );
    }
}
