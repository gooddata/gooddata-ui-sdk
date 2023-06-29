// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";
import { DashboardContext } from "../../types/commonTypes.js";
import { Drill } from "../../commands/drill.js";
import { DashboardDrillResolved, drillRequested, drillResolved } from "../../events/drill.js";
import { filterDrillsByDrillEvent } from "../../../_staging/drills/drillingUtils.js";

export function* drillHandler(ctx: DashboardContext, cmd: Drill): SagaIterator<DashboardDrillResolved> {
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
}
