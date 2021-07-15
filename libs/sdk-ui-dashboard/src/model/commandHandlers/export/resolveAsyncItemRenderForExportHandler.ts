// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes";
import { internalErrorOccurred } from "../../events/general";
import { ResolveAsyncRenderForExport } from "../../commands/export";
import { asyncRenderForExportResolved } from "../../events/export";

export function resolveAsyncRenderForExportHandler(
    ctx: DashboardContext,
    cmd: ResolveAsyncRenderForExport,
): any {
    // eslint-disable-next-line no-console
    console.debug("handling resolve async render for export", cmd, "in context", ctx);

    try {
        const {
            payload: { id },
            correlationId,
        } = cmd;

        return asyncRenderForExportResolved(id, ctx, correlationId);
    } catch (e) {
        throw internalErrorOccurred(
            ctx,
            "An unexpected error has occurred while resolving async rendering for the export",
            e,
            cmd.correlationId,
        );
    }
}
