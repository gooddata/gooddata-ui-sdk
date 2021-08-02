// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put } from "redux-saga/effects";
import { DashboardContext } from "../../types/commonTypes";
import { DrillToCustomUrl } from "../../commands/drill";
import {
    DashboardDrillToCustomUrlResolved,
    drillToCustomUrlRequested,
    drillToCustomUrlResolved,
} from "../../events/drill";
import { resolveDrillToCustomUrl } from "./resolveDrillToCustomUrl";

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

    const resolvedUrl = yield call(
        resolveDrillToCustomUrl,
        cmd.payload.drillDefinition,
        cmd.payload.drillEvent.widgetRef!,
        cmd.payload.drillEvent,
        ctx,
    );

    return drillToCustomUrlResolved(
        ctx,
        resolvedUrl,
        cmd.payload.drillDefinition,
        cmd.payload.drillEvent,
        cmd.correlationId,
    );
}
