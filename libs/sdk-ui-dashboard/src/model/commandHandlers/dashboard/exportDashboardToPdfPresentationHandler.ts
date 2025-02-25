// (C) 2021-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";
import { IExportResult } from "@gooddata/sdk-backend-spi";

import { DashboardContext } from "../../types/commonTypes.js";
import { ExportDashboardToPdf } from "../../commands/index.js";
import {
    DashboardExportToPdfPresentationResolved,
    dashboardExportToPdfPresentationRequested,
    dashboardExportToPdfPresentationResolved,
} from "../../events/dashboard.js";
import { selectDashboardRef } from "../../store/meta/metaSelectors.js";
import { invalidArgumentsProvided } from "../../events/general.js";

export function* exportDashboardToPdfPresentationHandler(
    ctx: DashboardContext,
    cmd: ExportDashboardToPdf,
): SagaIterator<DashboardExportToPdfPresentationResolved> {
    yield put(dashboardExportToPdfPresentationRequested(ctx, cmd.correlationId));

    const dashboardRef = yield select(selectDashboardRef);
    if (!dashboardRef) {
        throw invalidArgumentsProvided(ctx, cmd, "Dashboard to export to EXCEL must have an ObjRef.");
    }

    //TODO: Implement the following function

    const sanitizedResult: IExportResult = {
        uri: "",
        fileName: "",
        objectUrl: "",
    };

    return dashboardExportToPdfPresentationResolved(ctx, sanitizedResult, cmd.correlationId);
}
