// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { all, call, put, SagaReturnType } from "redux-saga/effects";
import { DashboardContext } from "../../types/commonTypes";
import { DrillToAttributeUrl } from "../../commands/drill";
import {
    DashboardDrillToAttributeUrlResolved,
    drillToAttributeUrlRequested,
    drillToAttributeUrlResolved,
} from "../../events/drill";
import { resolveDrillToAttributeUrl } from "./resolveDrillToAttributeUrl";
import { getDrillToUrlFiltersWithResolvedValues } from "./getDrillToUrlFilters";

export function* drillToAttributeUrlHandler(
    ctx: DashboardContext,
    cmd: DrillToAttributeUrl,
): SagaIterator<DashboardDrillToAttributeUrlResolved> {
    yield put(
        drillToAttributeUrlRequested(
            ctx,
            cmd.payload.drillDefinition,
            cmd.payload.drillEvent,
            cmd.correlationId,
        ),
    );

    const [resolvedUrl, filtersInfo]: [
        SagaReturnType<typeof resolveDrillToAttributeUrl>,
        SagaReturnType<typeof getDrillToUrlFiltersWithResolvedValues>,
    ] = yield all([
        call(resolveDrillToAttributeUrl, cmd.payload.drillDefinition, cmd.payload.drillEvent, ctx),
        call(getDrillToUrlFiltersWithResolvedValues, ctx, cmd.payload.drillEvent.widgetRef!),
    ]);

    return drillToAttributeUrlResolved(
        ctx,
        resolvedUrl!,
        cmd.payload.drillDefinition,
        cmd.payload.drillEvent,
        filtersInfo,
        cmd.correlationId,
    );
}
