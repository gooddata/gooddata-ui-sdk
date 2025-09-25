// (C) 2021-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { SagaReturnType, call, put, select } from "redux-saga/effects";

import { IExportResult } from "@gooddata/sdk-backend-spi";
import { FilterContextItem, ObjRef } from "@gooddata/sdk-model";

import { ExportDashboardToExcel } from "../../commands/index.js";
import {
    DashboardExportToExcelResolved,
    dashboardExportToExcelRequested,
    dashboardExportToExcelResolved,
} from "../../events/dashboard.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { selectFilterContextFilters } from "../../store/filterContext/filterContextSelectors.js";
import { selectFilterViews } from "../../store/filterViews/filterViewsReducersSelectors.js";
import { selectDashboardRef, selectIsFiltersChanged } from "../../store/meta/metaSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { PromiseFnReturnType } from "../../types/sagas.js";

function exportDashboardToTabular(
    ctx: DashboardContext,
    dashboardRef: ObjRef,
    title?: string,
    mergeHeaders?: boolean,
    exportInfo?: boolean,
    widgetIds?: string[],
    dashboardFiltersOverride?: FilterContextItem[],
    format?: "XLSX" | "PDF",
    pdfConfiguration?: {
        pageSize?: "A3" | "A4" | "LETTER";
        pageOrientation?: "PORTRAIT" | "LANDSCAPE";
        showInfoPage?: boolean;
    },
): Promise<IExportResult> {
    const { backend, workspace } = ctx;
    return backend.workspace(workspace).dashboards().exportDashboardToTabular(dashboardRef, {
        title,
        format,
        mergeHeaders,
        exportInfo,
        dashboardFiltersOverride,
        widgetIds,
        pdfConfiguration,
    });
}

export function* exportToTabularHandler(
    ctx: DashboardContext,
    cmd: ExportDashboardToExcel,
): SagaIterator<DashboardExportToExcelResolved> {
    yield put(dashboardExportToExcelRequested(ctx, cmd.correlationId));

    const dashboardRef = yield select(selectDashboardRef);
    if (!dashboardRef) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            "Dashboard to export to tabular format must have an ObjRef.",
        );
    }

    const { mergeHeaders, exportInfo, widgetIds, fileName, format, pdfConfiguration } = cmd.payload;
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
        format,
        pdfConfiguration,
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
