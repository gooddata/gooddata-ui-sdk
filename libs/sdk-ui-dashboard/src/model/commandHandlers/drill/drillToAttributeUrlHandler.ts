// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { dispatchDashboardEvent } from "../../eventEmitter/eventDispatcher";
import { DashboardContext } from "../../types/commonTypes";
import { internalErrorOccurred } from "../../events/general";
import { DrillToAttributeUrl } from "../../commands/drill";
import { drillToAttributeUrlTriggered } from "../../events/drill";
import { resolveDrillToAttributeUrl } from "./resolveDrillToAttributeUrl";
import { SagaReturnType, call } from "redux-saga/effects";

export function* drillToAttributeUrlHandler(
    ctx: DashboardContext,
    cmd: DrillToAttributeUrl,
): SagaIterator<void> {
    // eslint-disable-next-line no-console
    console.debug("handling drill to attribute url", cmd, "in context", ctx);

    try {
        const resolvedUrl: SagaReturnType<typeof resolveDrillToAttributeUrl> = yield call(
            resolveDrillToAttributeUrl,
            cmd.payload.drillDefinition,
            cmd.payload.drillEvent,
            ctx,
        );

        yield dispatchDashboardEvent(
            drillToAttributeUrlTriggered(
                ctx,
                resolvedUrl!,
                cmd.payload.drillDefinition,
                cmd.payload.drillEvent,
                cmd.correlationId,
            ),
        );
    } catch (e) {
        yield dispatchDashboardEvent(
            internalErrorOccurred(
                ctx,
                "An unexpected error has occurred while drilling to attribute url",
                e,
                cmd.correlationId,
            ),
        );
    }
}
