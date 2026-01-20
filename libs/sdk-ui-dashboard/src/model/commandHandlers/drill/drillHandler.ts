// (C) 2021-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";

import { filterDrillsByDrillEvent } from "../../../_staging/drills/drillingUtils.js";
import { type IDrill } from "../../commands/drill.js";
import { type IDashboardDrillResolved, drillRequested, drillResolved } from "../../events/drill.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* drillHandler(ctx: DashboardContext, cmd: IDrill): SagaIterator<IDashboardDrillResolved> {
    yield put(drillRequested(ctx, cmd.payload.drillEvent, cmd.payload.drillContext, cmd.correlationId));

    // TODO: better signature
    const validDrillDefinitions = filterDrillsByDrillEvent(
        cmd.payload.drillEvent.drillDefinitions,
        cmd.payload.drillEvent,
    );

    return drillResolved(
        ctx,
        { ...cmd.payload.drillEvent, drillDefinitions: validDrillDefinitions },
        cmd.payload.drillContext,
        cmd.correlationId,
    );
}
