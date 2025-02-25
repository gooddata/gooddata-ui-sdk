// (C) 2021-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";
import { IExportResult } from "@gooddata/sdk-backend-spi";

import { DashboardContext } from "../../types/commonTypes.js";
import { ExportDashboardToPdf } from "../../commands/index.js";
import {
    DashboardExportToPptPresentationResolved,
    dashboardExportToPptPresentationRequested,
    dashboardExportToPptPresentationResolved,
} from "../../events/dashboard.js";
import { selectDashboardRef } from "../../store/meta/metaSelectors.js";
import { invalidArgumentsProvided } from "../../events/general.js";

export function* exportDashboardToPptPresentationHandler(
    ctx: DashboardContext,
    cmd: ExportDashboardToPdf,
): SagaIterator<DashboardExportToPptPresentationResolved> {
    yield put(dashboardExportToPptPresentationRequested(ctx, cmd.correlationId));

    const dashboardRef = yield select(selectDashboardRef);
    if (!dashboardRef) {
        throw invalidArgumentsProvided(ctx, cmd, "Dashboard to export to PPT must have an ObjRef.");
    }

    //TODO: Implement the following function

    const sanitizedResult: IExportResult = {
        uri: "",
        fileName: "",
        objectUrl: "",
    };

    return dashboardExportToPptPresentationResolved(ctx, sanitizedResult, cmd.correlationId);
}
