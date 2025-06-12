// (C) 2024-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, select } from "redux-saga/effects";
import { IExportResult } from "@gooddata/sdk-backend-spi";
import { DashboardInsightWidgetExportResolved, insightWidgetExportResolved } from "../../events/insight.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { PromiseFnReturnType } from "../../types/sagas.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { selectDashboardRef } from "../../store/meta/metaSelectors.js";
import { ExportImageInsightWidget } from "../../commands/insight.js";
import { selectFilterContextFilters } from "../../store/filterContext/filterContextSelectors.js";
import { ensureAllTimeFilterForExport } from "../../../_staging/exportUtils/filterUtils.js";

export function* exportImageInsightWidgetHandler(
    ctx: DashboardContext,
    cmd: ExportImageInsightWidget,
): SagaIterator<DashboardInsightWidgetExportResolved> {
    const { ref, filename } = cmd.payload;
    const { workspace, backend } = ctx;

    const dashboardRef = yield select(selectDashboardRef);
    if (!dashboardRef) {
        throw invalidArgumentsProvided(ctx, cmd, "Dashboard to export to image must have an ObjRef.");
    }

    const filterContextFilters = yield select(selectFilterContextFilters);
    const effectiveFilters = ensureAllTimeFilterForExport(filterContextFilters);

    const exportDashboardToImage = backend.workspace(workspace).dashboards().exportDashboardToImage;
    const result: PromiseFnReturnType<typeof exportDashboardToImage> = yield call(
        exportDashboardToImage,
        dashboardRef,
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
