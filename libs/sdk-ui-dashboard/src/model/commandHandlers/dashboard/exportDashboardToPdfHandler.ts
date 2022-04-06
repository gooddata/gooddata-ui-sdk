// (C) 2021-2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { ObjRef, FilterContextItem } from "@gooddata/sdk-model";

import { DashboardContext } from "../../types/commonTypes";
import { ExportDashboardToPdf } from "../../commands";
import {
    dashboardExportToPdfRequested,
    DashboardExportToPdfResolved,
    dashboardExportToPdfResolved,
} from "../../events/dashboard";
import { selectDashboardRef } from "../../store/meta/metaSelectors";
import { invalidArgumentsProvided } from "../../events/general";
import { selectFilterContextFilters } from "../../store/filterContext/filterContextSelectors";
import { ensureAllTimeFilterForExport } from "../../../_staging/exportUtils/filterUtils";

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

    const filterContextFilters: ReturnType<typeof selectFilterContextFilters> = yield select(
        selectFilterContextFilters,
    );

    const effectiveFilters = ensureAllTimeFilterForExport(filterContextFilters);

    const resultUri = yield call(exportDashboardToPdf, ctx, dashboardRef, effectiveFilters);

    return dashboardExportToPdfResolved(ctx, resultUri, cmd.correlationId);
}
