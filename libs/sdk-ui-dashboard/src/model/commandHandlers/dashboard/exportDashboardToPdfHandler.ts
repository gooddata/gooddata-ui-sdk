// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { FilterContextItem } from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";

import { DashboardContext } from "../../types/commonTypes";
import { ExportDashboardToPdf } from "../../commands";
import {
    dashboardExportToPdfRequested,
    DashboardExportToPdfResolved,
    dashboardExportToPdfResolved,
} from "../../events/dashboard";
import { selectDashboardRef } from "../../state/meta/metaSelectors";
import { invalidArgumentsProvided } from "../../events/general";
import { selectFilterContextFilters } from "../../state/filterContext/filterContextSelectors";

function exportDashboardToPdf(
    ctx: DashboardContext,
    dashboardRef: ObjRef,
    filters: FilterContextItem[] | undefined,
): Promise<string> {
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

    const filterContextFilters = yield select(selectFilterContextFilters);

    const resultUri = yield call(exportDashboardToPdf, ctx, dashboardRef, filterContextFilters);

    return dashboardExportToPdfResolved(ctx, resultUri, cmd.correlationId);
}
