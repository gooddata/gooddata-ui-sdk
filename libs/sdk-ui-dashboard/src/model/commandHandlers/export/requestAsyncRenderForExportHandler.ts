// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes";
import { internalErrorOccurred } from "../../events/general";
import { RequestAsyncRenderForExport } from "../../commands/export";
import { asyncRenderForExportRequested } from "../../events/export";

export function requestAsyncRenderForExportHandler(
    ctx: DashboardContext,
    cmd: RequestAsyncRenderForExport,
): any {
    // eslint-disable-next-line no-console
    console.debug("handling request async render for export", cmd, "in context", ctx);

    try {
        const {
            payload: { id },
            correlationId,
        } = cmd;

        return asyncRenderForExportRequested(id, ctx, correlationId);
    } catch (e) {
        throw internalErrorOccurred(
            ctx,
            "An unexpected error has occurred while requesting async rendering for the export",
            e,
            cmd.correlationId,
        );
    }
}
