// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes";
import { internalErrorOccurred } from "../../events/general";
import { UserInteraction } from "../../commands/userInteraction";
import { DashboardUserInteractionTriggered, userInteractionTriggered } from "../../events/userInteraction";

export function userInteractionHandler(
    ctx: DashboardContext,
    cmd: UserInteraction,
): DashboardUserInteractionTriggered {
    // eslint-disable-next-line no-console
    console.debug("handling user interaction", cmd, "in context", ctx);

    try {
        return userInteractionTriggered(ctx, cmd.payload.interaction, cmd.correlationId);
    } catch (e) {
        throw internalErrorOccurred(
            ctx,
            "An unexpected error has occurred while logging",
            e,
            cmd.correlationId,
        );
    }
}
