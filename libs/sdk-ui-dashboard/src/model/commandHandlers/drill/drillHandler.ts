// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";
import { DashboardContext } from "../../types/commonTypes";
import { internalErrorOccurred } from "../../events/general";
import { Drill } from "../../commands/drill";
import { DashboardDrillResolved, drillResolved, drillRequested } from "../../events/drill";
import { filterDrillsByDrillEvent } from "../../../_staging/drills/drillingUtils";

export function* drillHandler(ctx: DashboardContext, cmd: Drill): SagaIterator<DashboardDrillResolved> {
    // eslint-disable-next-line no-console
    console.debug("handling drill", cmd, "in context", ctx);

    try {
        yield put(drillRequested(ctx, cmd.payload.drillEvent, cmd.payload.drillContext, cmd.correlationId));

        // TODO: better signature
        const validDrillDefinitions = filterDrillsByDrillEvent(
            cmd.payload.drillEvent.drillDefinitions!,
            cmd.payload.drillEvent,
        );

        return drillResolved(
            ctx,
            { ...cmd.payload.drillEvent, drillDefinitions: validDrillDefinitions },
            cmd.payload.drillContext,
            cmd.correlationId,
        );
    } catch (e) {
        throw internalErrorOccurred(
            ctx,
            "An unexpected error has occurred while drilling",
            e,
            cmd.correlationId,
        );
    }
}
