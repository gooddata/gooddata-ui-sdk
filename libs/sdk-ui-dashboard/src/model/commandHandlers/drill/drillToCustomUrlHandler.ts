// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { all, call, put, SagaReturnType } from "redux-saga/effects";
import { DashboardContext } from "../../types/commonTypes";
import { DrillToCustomUrl } from "../../commands/drill";
import {
    DashboardDrillToCustomUrlResolved,
    drillToCustomUrlRequested,
    drillToCustomUrlResolved,
} from "../../events/drill";
import { resolveDrillToCustomUrl } from "./resolveDrillToCustomUrl";
import { getDrillToUrlFiltersWithResolvedValues } from "./getDrillToUrlFilters";

export function* drillToCustomUrlHandler(
    ctx: DashboardContext,
    cmd: DrillToCustomUrl,
): SagaIterator<DashboardDrillToCustomUrlResolved> {
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
