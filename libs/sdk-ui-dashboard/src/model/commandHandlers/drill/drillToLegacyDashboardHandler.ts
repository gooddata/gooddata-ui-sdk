// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";
import { DashboardContext } from "../../types/commonTypes";
import {
    DashboardDrillToLegacyDashboardResolved,
    drillToLegacyDashboardRequested,
    drillToLegacyDashboardResolved,
} from "../../events/drill";
import { DrillToLegacyDashboard } from "../../commands";

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
