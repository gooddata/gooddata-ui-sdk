// (C) 2021-2025 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import {
    type FiltersByTab,
    type IDashboardExportPresentationOptions,
    type IExportResult,
} from "@gooddata/sdk-backend-spi";
import { type FilterContextItem, type ObjRef } from "@gooddata/sdk-model";

import { ensureAllTimeFilterForExport } from "../../../_staging/exportUtils/filterUtils.js";
import { type ExportDashboardToPptPresentation } from "../../commands/index.js";
import {
    type DashboardExportToPptPresentationResolved,
    dashboardExportToPptPresentationRequested,
    dashboardExportToPptPresentationResolved,
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

function exportDashboardToPptPresentation(
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
        .exportDashboardToPresentation(dashboardRef, "PPTX", filters, filtersByTab, options);
}

export function* exportDashboardToPptPresentationHandler(
    ctx: DashboardContext,
    cmd: ExportDashboardToPptPresentation,
): SagaIterator<DashboardExportToPptPresentationResolved> {
    yield put(dashboardExportToPptPresentationRequested(ctx, cmd.correlationId));

    const dashboardRef = yield select(selectDashboardRef);
    if (!dashboardRef) {
        throw invalidArgumentsProvided(ctx, cmd, "Dashboard to export to PPT must have an ObjRef.");
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

    const result: PromiseFnReturnType<typeof exportDashboardToPptPresentation> = yield call(
        exportDashboardToPptPresentation,
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

    return dashboardExportToPptPresentationResolved(ctx, sanitizedResult, cmd.correlationId);
}
