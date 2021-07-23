// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { SagaReturnType, call, put } from "redux-saga/effects";
import { DashboardContext } from "../../types/commonTypes";
import { internalErrorOccurred } from "../../events/general";
import { DrillToAttributeUrl } from "../../commands/drill";
import {
    DashboardDrillToAttributeUrlResolved,
    drillToAttributeUrlResolved,
    drillToAttributeUrlRequested,
} from "../../events/drill";
import { resolveDrillToAttributeUrl } from "./resolveDrillToAttributeUrl";

export function* drillToAttributeUrlHandler(
    ctx: DashboardContext,
    cmd: DrillToAttributeUrl,
): SagaIterator<DashboardDrillToAttributeUrlResolved> {
    // eslint-disable-next-line no-console
    console.debug("handling drill to attribute url", cmd, "in context", ctx);

    try {
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
    } catch (e) {
        throw internalErrorOccurred(
            ctx,
            "An unexpected error has occurred while drilling to attribute url",
            e,
            cmd.correlationId,
        );
    }
}
