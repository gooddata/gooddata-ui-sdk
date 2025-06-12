// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";
import { DashboardContext } from "../../types/commonTypes.js";
import {
    DashboardDrillToLegacyDashboardResolved,
    drillToLegacyDashboardRequested,
    drillToLegacyDashboardResolved,
} from "../../events/drill.js";
import { DrillToLegacyDashboard } from "../../commands/index.js";

export function* drillToLegacyDashboardHandler(
    ctx: DashboardContext,
    cmd: DrillToLegacyDashboard,
): SagaIterator<DashboardDrillToLegacyDashboardResolved> {
    yield put(
        drillToLegacyDashboardRequested(
            ctx,
            cmd.payload.drillDefinition,
            cmd.payload.drillEvent,
            cmd.correlationId,
        ),
    );

    return drillToLegacyDashboardResolved(
        ctx,
        cmd.payload.drillDefinition,
        cmd.payload.drillEvent,
        cmd.correlationId,
    );
}
