// (C) 2021-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, all, call, put } from "redux-saga/effects";

import { getDrillToUrlFiltersWithResolvedValues } from "./getDrillToUrlFilters.js";
import { resolveDrillToCustomUrl } from "./resolveDrillToCustomUrl.js";
import { type IDrillToCustomUrl } from "../../commands/drill.js";
import {
    type IDashboardDrillToCustomUrlResolved,
    drillToCustomUrlRequested,
    drillToCustomUrlResolved,
} from "../../events/drill.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* drillToCustomUrlHandler(
    ctx: DashboardContext,
    cmd: IDrillToCustomUrl,
): SagaIterator<IDashboardDrillToCustomUrlResolved> {
    yield put(
        drillToCustomUrlRequested(
            ctx,
            cmd.payload.drillDefinition,
            cmd.payload.drillEvent,
            cmd.correlationId,
        ),
    );

    const [resolvedUrl, filtersInfo]: [
        SagaReturnType<typeof resolveDrillToCustomUrl>,
        SagaReturnType<typeof getDrillToUrlFiltersWithResolvedValues>,
    ] = yield all([
        call(
            resolveDrillToCustomUrl,
            cmd.payload.drillDefinition,
            cmd.payload.drillEvent.widgetRef!,
            cmd.payload.drillEvent,
            ctx,
            cmd,
        ),
        call(getDrillToUrlFiltersWithResolvedValues, ctx, cmd.payload.drillEvent.widgetRef!),
    ]);

    return drillToCustomUrlResolved(
        ctx,
        resolvedUrl,
        cmd.payload.drillDefinition,
        cmd.payload.drillEvent,
        filtersInfo,
        cmd.correlationId,
    );
}
