// (C) 2021-2025 GoodData Corporation
import { type SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";

import { type DrillToLegacyDashboard } from "../../commands/index.js";
import {
    type DashboardDrillToLegacyDashboardResolved,
    drillToLegacyDashboardRequested,
    drillToLegacyDashboardResolved,
} from "../../events/drill.js";
import { type DashboardContext } from "../../types/commonTypes.js";

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
