// (C) 2021-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { IExportResult } from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";

import { DashboardContext } from "../../types/commonTypes.js";
import { ExportDashboardToPdf } from "../../commands/index.js";
import {
    DashboardExportToExcelResolved,
    dashboardExportToExcelRequested,
    dashboardExportToExcelResolved,
} from "../../events/dashboard.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { selectDashboardRef, selectDashboardTitle } from "../../store/meta/metaSelectors.js";
import { PromiseFnReturnType } from "../../types/sagas.js";

function exportDashboardToTabular(
    ctx: DashboardContext,
    dashboardRef: ObjRef,
    title?: string,
): Promise<IExportResult> {
    const { backend, workspace } = ctx;
    return backend.workspace(workspace).dashboards().exportDashboardToTabular(dashboardRef, { title });
}

export function* exportDashboardToExcelHandler(
    ctx: DashboardContext,
    cmd: ExportDashboardToPdf,
): SagaIterator<DashboardExportToExcelResolved> {
    yield put(dashboardExportToExcelRequested(ctx, cmd.correlationId));

    const dashboardRef = yield select(selectDashboardRef);
    if (!dashboardRef) {
        throw invalidArgumentsProvided(ctx, cmd, "Dashboard to export to EXCEL must have an ObjRef.");
    }

    const title = yield select(selectDashboardTitle);
    const result: PromiseFnReturnType<typeof exportDashboardToTabular> = yield call(
        exportDashboardToTabular,
        ctx,
        dashboardRef,
        title,
    );

    // prepend hostname if provided so that the results are downloaded from there, not from where the app is hosted
    const fullUri = ctx.backend.config.hostname
        ? new URL(result.uri, ctx.backend.config.hostname).href
        : result.uri;

    const sanitizedResult: IExportResult = {
        ...result,
        uri: fullUri,
    };

    return dashboardExportToExcelResolved(ctx, sanitizedResult, cmd.correlationId);
}
