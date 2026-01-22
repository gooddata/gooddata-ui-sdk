// (C) 2021-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import {
    type FiltersByTab,
    type IDashboardExportPdfOptions,
    type IExportResult,
} from "@gooddata/sdk-backend-spi";
import { type FilterContextItem, type ObjRef } from "@gooddata/sdk-model";

import { ensureAllTimeFilterForExport } from "../../../_staging/exportUtils/filterUtils.js";
import { type IExportDashboardToPdf } from "../../commands/dashboard.js";
import {
    type IDashboardExportToPdfResolved,
    dashboardExportToPdfRequested,
    dashboardExportToPdfResolved,
} from "../../events/dashboard.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { selectExportResultPollingTimeout } from "../../store/config/configSelectors.js";
import { selectDashboardRef } from "../../store/meta/metaSelectors.js";
import {
    selectFilterContextFilters,
    selectFiltersByTab,
} from "../../store/tabs/filterContext/filterContextSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { type PromiseFnReturnType } from "../../types/sagas.js";

function exportDashboardToPdf(
    ctx: DashboardContext,
    dashboardRef: ObjRef,
    filters: FilterContextItem[] | undefined,
    filtersByTab: FiltersByTab | undefined,
    options?: IDashboardExportPdfOptions,
): Promise<IExportResult> {
    const { backend, workspace } = ctx;
    return backend
        .workspace(workspace)
        .dashboards()
        .exportDashboardToPdf(dashboardRef, filters, filtersByTab, options);
}

export function* exportDashboardToPdfHandler(
    ctx: DashboardContext,
    cmd: IExportDashboardToPdf,
): SagaIterator<IDashboardExportToPdfResolved> {
    yield put(dashboardExportToPdfRequested(ctx, cmd.correlationId));

    const dashboardRef = yield select(selectDashboardRef);
    if (!dashboardRef) {
        throw invalidArgumentsProvided(ctx, cmd, "Dashboard to export to PDF must have an ObjRef.");
    }

    const filterContextFilters: ReturnType<typeof selectFilterContextFilters> =
        yield select(selectFilterContextFilters);

    const filtersByTab: ReturnType<typeof selectFiltersByTab> = yield select(selectFiltersByTab);

    const effectiveFilters = ensureAllTimeFilterForExport(filterContextFilters);
    const effectiveFiltersByTab: FiltersByTab = Object.entries(filtersByTab).reduce(
        (acc, [tabId, filters]) => {
            acc[tabId] = ensureAllTimeFilterForExport(filters);
            return acc;
        },
        {} as FiltersByTab,
    );

    const timeout: ReturnType<typeof selectExportResultPollingTimeout> = yield select(
        selectExportResultPollingTimeout,
    );

    const result: PromiseFnReturnType<typeof exportDashboardToPdf> = yield call(
        exportDashboardToPdf,
        ctx,
        dashboardRef,
        effectiveFilters,
        effectiveFiltersByTab,
        { timeout },
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
