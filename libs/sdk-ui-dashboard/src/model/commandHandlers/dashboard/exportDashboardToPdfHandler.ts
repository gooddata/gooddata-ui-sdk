// (C) 2021-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { IExportResult } from "@gooddata/sdk-backend-spi";
import { FilterContextItem, ObjRef } from "@gooddata/sdk-model";

import { ensureAllTimeFilterForExport } from "../../../_staging/exportUtils/filterUtils.js";
import { ExportDashboardToPdf } from "../../commands/index.js";
import {
    DashboardExportToPdfResolved,
    dashboardExportToPdfRequested,
    dashboardExportToPdfResolved,
} from "../../events/dashboard.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { selectDashboardRef } from "../../store/meta/metaSelectors.js";
import { selectFilterContextFilters } from "../../store/tabs/filterContext/filterContextSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { PromiseFnReturnType } from "../../types/sagas.js";

function exportDashboardToPdf(
    ctx: DashboardContext,
    dashboardRef: ObjRef,
    filters: FilterContextItem[] | undefined,
): Promise<IExportResult> {
    const { backend, workspace } = ctx;
    return backend.workspace(workspace).dashboards().exportDashboardToPdf(dashboardRef, filters);
}

export function* exportDashboardToPdfHandler(
    ctx: DashboardContext,
    cmd: ExportDashboardToPdf,
): SagaIterator<DashboardExportToPdfResolved> {
    yield put(dashboardExportToPdfRequested(ctx, cmd.correlationId));

    const dashboardRef = yield select(selectDashboardRef);
    if (!dashboardRef) {
        throw invalidArgumentsProvided(ctx, cmd, "Dashboard to export to PDF must have an ObjRef.");
    }

    const filterContextFilters: ReturnType<typeof selectFilterContextFilters> =
        yield select(selectFilterContextFilters);

    const effectiveFilters = ensureAllTimeFilterForExport(filterContextFilters);

    const result: PromiseFnReturnType<typeof exportDashboardToPdf> = yield call(
        exportDashboardToPdf,
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

    return dashboardExportToPdfResolved(ctx, sanitizedResult, cmd.correlationId);
}
