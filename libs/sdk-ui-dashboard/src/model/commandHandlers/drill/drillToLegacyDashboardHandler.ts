// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";
import { DashboardContext } from "../../types/commonTypes";
import { internalErrorOccurred } from "../../events/general";
import {
    DashboardDrillToLegacyDashboardResolved,
    drillToLegacyDashboardResolved,
    drillToLegacyDashboardRequested,
} from "../../events/drill";
import { DrillToLegacyDashboard } from "../../commands";

export function* drillToLegacyDashboardHandler(
    ctx: DashboardContext,
    cmd: DrillToLegacyDashboard,
): SagaIterator<DashboardDrillToLegacyDashboardResolved> {
    // eslint-disable-next-line no-console
    console.debug("handling drill to legacy dashboard", cmd, "in context", ctx);

    try {
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
    } catch (e) {
        throw internalErrorOccurred(
            ctx,
            "An unexpected error has occurred while drilling to legacy dashboard",
            e,
            cmd.correlationId,
        );
    }
}
