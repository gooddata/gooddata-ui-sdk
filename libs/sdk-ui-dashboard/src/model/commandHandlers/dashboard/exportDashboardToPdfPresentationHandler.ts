// (C) 2021-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import {
    type FiltersByTab,
    type IDashboardExportPresentationOptions,
    type IExportResult,
} from "@gooddata/sdk-backend-spi";
import { type FilterContextItem, type ObjRef } from "@gooddata/sdk-model";

import { ensureAllTimeFilterForExport } from "../../../_staging/exportUtils/filterUtils.js";
import { type IExportDashboardToPdfPresentation } from "../../commands/index.js";
import {
    type IDashboardExportToPdfPresentationResolved,
    dashboardExportToPdfPresentationRequested,
    dashboardExportToPdfPresentationResolved,
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

function exportDashboardToPdfPresentation(
    ctx: DashboardContext,
    dashboardRef: ObjRef,
    filters: FilterContextItem[] | undefined,
    filtersByTab: FiltersByTab | undefined,
    options: IDashboardExportPresentationOptions | undefined,
): Promise<IExportResult> {
    const { backend, workspace } = ctx;
    return backend
        .workspace(workspace)
        .dashboards()
        .exportDashboardToPresentation(dashboardRef, "PDF", filters, filtersByTab, options);
}

export function* exportDashboardToPdfPresentationHandler(
    ctx: DashboardContext,
    cmd: IExportDashboardToPdfPresentation,
): SagaIterator<IDashboardExportToPdfPresentationResolved> {
    yield put(dashboardExportToPdfPresentationRequested(ctx, cmd.correlationId));

    const dashboardRef = yield select(selectDashboardRef);
    if (!dashboardRef) {
        throw invalidArgumentsProvided(ctx, cmd, "Dashboard to export to EXCEL must have an ObjRef.");
    }

    const filterContextFilters: ReturnType<typeof selectFilterContextFilters> =
        yield select(selectFilterContextFilters);

    const filtersByTab: ReturnType<typeof selectFiltersByTab> = yield select(selectFiltersByTab);

    const effectiveFilters = ensureAllTimeFilterForExport(cmd.payload?.filters ?? filterContextFilters);
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

    const options: IDashboardExportPresentationOptions = {
        ...(cmd.payload?.options ?? {}),
        timeout,
    };

    const result: PromiseFnReturnType<typeof exportDashboardToPdfPresentation> = yield call(
        exportDashboardToPdfPresentation,
        ctx,
        dashboardRef,
        effectiveFilters,
        effectiveFiltersByTab,
        options,
    );

    // prepend hostname if provided so that the results are downloaded from there, not from where the app is hosted
    const fullUri = ctx.backend.config.hostname
        ? new URL(result.uri, ctx.backend.config.hostname).href
        : result.uri;

    const sanitizedResult: IExportResult = {
        ...result,
        uri: fullUri,
    };

    return dashboardExportToPdfPresentationResolved(ctx, sanitizedResult, cmd.correlationId);
}
