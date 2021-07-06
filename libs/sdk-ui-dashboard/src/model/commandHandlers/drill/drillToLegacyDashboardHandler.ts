// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes";
import { internalErrorOccurred } from "../../events/general";
import {
    DashboardDrillToLegacyDashboardTriggered,
    drillToLegacyDashboardTriggered,
} from "../../events/drill";
import { DrillToLegacyDashboard } from "../../commands";

export function drillToLegacyDashboardHandler(
    ctx: DashboardContext,
    cmd: DrillToLegacyDashboard,
): DashboardDrillToLegacyDashboardTriggered {
    // eslint-disable-next-line no-console
    console.debug("handling drill to legacy dashboard", cmd, "in context", ctx);

    try {
        return drillToLegacyDashboardTriggered(
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
