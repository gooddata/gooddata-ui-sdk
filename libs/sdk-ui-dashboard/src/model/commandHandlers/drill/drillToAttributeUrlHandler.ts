// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put, SagaReturnType } from "redux-saga/effects";
import { DashboardContext } from "../../types/commonTypes";
import { DrillToAttributeUrl } from "../../commands/drill";
import {
    DashboardDrillToAttributeUrlResolved,
    drillToAttributeUrlRequested,
    drillToAttributeUrlResolved,
} from "../../events/drill";
import { resolveDrillToAttributeUrl } from "./resolveDrillToAttributeUrl";

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

    const resolvedUrl: SagaReturnType<typeof resolveDrillToAttributeUrl> = yield call(
        resolveDrillToAttributeUrl,
        cmd.payload.drillDefinition,
        cmd.payload.drillEvent,
        ctx,
    );

    return drillToAttributeUrlResolved(
        ctx,
        resolvedUrl!,
        cmd.payload.drillDefinition,
        cmd.payload.drillEvent,
        cmd.correlationId,
    );
}
