// (C) 2024-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, select } from "redux-saga/effects";
import { IExportResult } from "@gooddata/sdk-backend-spi";
import { DashboardInsightWidgetExportResolved, insightWidgetExportResolved } from "../../events/insight.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { PromiseFnReturnType } from "../../types/sagas.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { selectFilterContextFilters } from "../../store/filterContext/filterContextSelectors.js";
import { selectDashboardRef } from "../../store/meta/metaSelectors.js";
import { ensureAllTimeFilterForExport } from "../../../_staging/exportUtils/filterUtils.js";
import { ExportSlidesInsightWidget } from "../../commands/insight.js";

export function* exportSlidesInsightWidgetHandler(
    ctx: DashboardContext,
    cmd: ExportSlidesInsightWidget,
): SagaIterator<DashboardInsightWidgetExportResolved> {
    const { ref, filename, exportType } = cmd.payload;
    const { workspace, backend } = ctx;

    const dashboardRef = yield select(selectDashboardRef);
    if (!dashboardRef) {
        throw invalidArgumentsProvided(ctx, cmd, "Dashboard to export to EXCEL must have an ObjRef.");
    }
    const filterContextFilters = yield select(selectFilterContextFilters);
    const effectiveFilters = ensureAllTimeFilterForExport(filterContextFilters);

    const exportDashboardToPresentation = backend
        .workspace(workspace)
        .dashboards().exportDashboardToPresentation;
    const result: PromiseFnReturnType<typeof exportDashboardToPresentation> = yield call(
        exportDashboardToPresentation,
        dashboardRef,
        exportType === "pptx" ? "PPTX" : "PDF",
        effectiveFilters,
        {
            widgetIds: [ref],
            filename,
        },
    );
    // prepend hostname if provided so that the results are downloaded from there, not from where the app is hosted
    const fullUri = ctx.backend.config.hostname
        ? new URL(result.uri, ctx.backend.config.hostname).href
        : result.uri;
    const sanitizedResult: IExportResult = {
        ...result,
        uri: fullUri,
    };
    return insightWidgetExportResolved(ctx, sanitizedResult, cmd.correlationId);
}
