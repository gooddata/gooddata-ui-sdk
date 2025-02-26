// (C) 2021-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { IExportResult } from "@gooddata/sdk-backend-spi";
import { FilterContextItem, ObjRef } from "@gooddata/sdk-model";

import { DashboardContext } from "../../types/commonTypes.js";
import { ExportDashboardToPdf } from "../../commands/index.js";
import {
    DashboardExportToPptPresentationResolved,
    dashboardExportToPptPresentationRequested,
    dashboardExportToPptPresentationResolved,
} from "../../events/dashboard.js";
import { selectDashboardRef } from "../../store/meta/metaSelectors.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { PromiseFnReturnType } from "../../types/sagas.js";
import { ensureAllTimeFilterForExport } from "../../../_staging/exportUtils/filterUtils.js";
import { selectFilterContextFilters } from "../../store/filterContext/filterContextSelectors.js";

function exportDashboardToPptPresentation(
    ctx: DashboardContext,
    dashboardRef: ObjRef,
    filters: FilterContextItem[] | undefined,
): Promise<IExportResult> {
    const { backend, workspace } = ctx;
    return backend
        .workspace(workspace)
        .dashboards()
        .exportDashboardToPresentation(dashboardRef, "pptx", filters);
}

export function* exportDashboardToPptPresentationHandler(
    ctx: DashboardContext,
    cmd: ExportDashboardToPdf,
): SagaIterator<DashboardExportToPptPresentationResolved> {
    yield put(dashboardExportToPptPresentationRequested(ctx, cmd.correlationId));

    const dashboardRef = yield select(selectDashboardRef);
    if (!dashboardRef) {
        throw invalidArgumentsProvided(ctx, cmd, "Dashboard to export to PPT must have an ObjRef.");
    }

    const filterContextFilters: ReturnType<typeof selectFilterContextFilters> = yield select(
        selectFilterContextFilters,
    );

    const effectiveFilters = ensureAllTimeFilterForExport(filterContextFilters);

    const result: PromiseFnReturnType<typeof exportDashboardToPptPresentation> = yield call(
        exportDashboardToPptPresentation,
        ctx,
        dashboardRef,
        effectiveFilters,
    );

    // prepend hostname if provided so that the results are downloaded from there, not from where the app is hosted
    const fullUri = ctx.backend.config.hostname
        ? new URL(result.uri, ctx.backend.config.hostname).href
        : result.uri;

    const sanitizedResult: IExportResult = {
        ...result,
        uri: fullUri,
    };

    return dashboardExportToPptPresentationResolved(ctx, sanitizedResult, cmd.correlationId);
}
