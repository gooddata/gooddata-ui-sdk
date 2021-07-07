// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes";
import { internalErrorOccurred } from "../../events/general";
import { Drill } from "../../commands/drill";
import { DashboardDrillTriggered, drillTriggered } from "../../events/drill";

export function drillHandler(ctx: DashboardContext, cmd: Drill): DashboardDrillTriggered {
    // eslint-disable-next-line no-console
    console.debug("handling drill", cmd, "in context", ctx);

    try {
        return drillTriggered(ctx, cmd.payload.drillEvent, cmd.payload.drillContext, cmd.correlationId);
    } catch (e) {
        throw internalErrorOccurred(
            ctx,
            "An unexpected error has occurred while drilling",
            e,
            cmd.correlationId,
        );
    }
}
