// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { FilterContextItem, isDashboardDateFilter } from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";

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

function exportDashboardToPdf(
    ctx: DashboardContext,
    dashboardRef: ObjRef,
    filters: FilterContextItem[] | undefined,
): Promise<string> {
    const { backend, workspace } = ctx;
    return backend.workspace(workspace).dashboards().exportDashboardToPdf(dashboardRef, filters);
}

// the value is taken from gdc-dashboards
const allTimeFilterContextItem: FilterContextItem = {
    dateFilter: {
        type: "absolute",
        granularity: "GDC.time.year",
    },
};

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

    // if there is no date filter, add an "all time" filter so that in case the dashboard is saved with some
    // date filter, it is overridden to All time for the purpose of the export
    const effectiveFilters: FilterContextItem[] = filterContextFilters.some(isDashboardDateFilter)
        ? filterContextFilters
        : [allTimeFilterContextItem, ...filterContextFilters];

    const resultUri = yield call(exportDashboardToPdf, ctx, dashboardRef, effectiveFilters);

    return dashboardExportToPdfResolved(ctx, resultUri, cmd.correlationId);
}
