// (C) 2021-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put, SagaReturnType, select } from "redux-saga/effects";
import { IExportResult } from "@gooddata/sdk-backend-spi";
import { FilterContextItem, ObjRef } from "@gooddata/sdk-model";

import { DashboardContext } from "../../types/commonTypes.js";
import { ExportDashboardToExcel } from "../../commands/index.js";
import {
    DashboardExportToExcelResolved,
    dashboardExportToExcelRequested,
    dashboardExportToExcelResolved,
} from "../../events/dashboard.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { selectDashboardRef, selectIsFiltersChanged } from "../../store/meta/metaSelectors.js";
import { PromiseFnReturnType } from "../../types/sagas.js";
import { selectFilterContextFilters } from "../../store/filterContext/filterContextSelectors.js";
import { selectFilterViews } from "../../store/filterViews/filterViewsReducersSelectors.js";

function exportDashboardToTabular(
    ctx: DashboardContext,
    dashboardRef: ObjRef,
    title?: string,
    mergeHeaders?: boolean,
    exportInfo?: boolean,
    widgetIds?: string[],
    dashboardFiltersOverride?: FilterContextItem[],
): Promise<IExportResult> {
    const { backend, workspace } = ctx;
    return backend.workspace(workspace).dashboards().exportDashboardToTabular(dashboardRef, {
        title,
        mergeHeaders,
        exportInfo,
        dashboardFiltersOverride,
        widgetIds,
    });
}

export function* exportDashboardToExcelHandler(
    ctx: DashboardContext,
    cmd: ExportDashboardToExcel,
): SagaIterator<DashboardExportToExcelResolved> {
    yield put(dashboardExportToExcelRequested(ctx, cmd.correlationId));

    const dashboardRef = yield select(selectDashboardRef);
    if (!dashboardRef) {
        throw invalidArgumentsProvided(ctx, cmd, "Dashboard to export to EXCEL must have an ObjRef.");
    }

    const { mergeHeaders, exportInfo, widgetIds, fileName } = cmd.payload;
    const isFilterContextChanged: SagaReturnType<typeof selectIsFiltersChanged> =
        yield select(selectIsFiltersChanged);
    const filterViews: SagaReturnType<typeof selectFilterViews> = yield select(selectFilterViews);
    const hasDefaultFilterViewApplied = filterViews.some((filterView) => filterView.isDefault);
    const filterContext: SagaReturnType<typeof selectFilterContextFilters> =
        yield select(selectFilterContextFilters);
    const result: PromiseFnReturnType<typeof exportDashboardToTabular> = yield call(
        exportDashboardToTabular,
        ctx,
        dashboardRef,
        fileName,
        mergeHeaders,
        exportInfo,
        widgetIds,
        isFilterContextChanged || hasDefaultFilterViewApplied ? filterContext : undefined,
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
