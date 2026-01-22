// (C) 2021-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";

import { type IDrillToLegacyDashboard } from "../../commands/drill.js";
import {
    type IDashboardDrillToLegacyDashboardResolved,
    drillToLegacyDashboardRequested,
    drillToLegacyDashboardResolved,
} from "../../events/drill.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* drillToLegacyDashboardHandler(
    ctx: DashboardContext,
    cmd: IDrillToLegacyDashboard,
): SagaIterator<IDashboardDrillToLegacyDashboardResolved> {
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
