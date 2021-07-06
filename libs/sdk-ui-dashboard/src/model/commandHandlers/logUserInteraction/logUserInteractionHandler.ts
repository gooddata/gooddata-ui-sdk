// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes";
import { internalErrorOccurred } from "../../events/general";
import { LogUserInteraction } from "../../commands/logUserInteraction";
import { DashboardUserInteractionLogged, userInteractionLogged } from "../../events/logUserInteraction";

export function logUserInteractionHandler(
    ctx: DashboardContext,
    cmd: LogUserInteraction,
): DashboardUserInteractionLogged {
    // eslint-disable-next-line no-console
    console.debug("handling log", cmd, "in context", ctx);

    try {
        return userInteractionLogged(ctx, cmd.payload.interaction, cmd.correlationId);
    } catch (e) {
        throw internalErrorOccurred(
            ctx,
            "An unexpected error has occurred while logging",
            e,
            cmd.correlationId,
        );
    }
}
