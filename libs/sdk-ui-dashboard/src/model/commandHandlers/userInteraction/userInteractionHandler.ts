// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes";
import { UserInteraction } from "../../commands/userInteraction";
import { DashboardUserInteractionTriggered, userInteractionTriggered } from "../../events/userInteraction";

export function userInteractionHandler(
    ctx: DashboardContext,
    cmd: UserInteraction,
): DashboardUserInteractionTriggered {
    return userInteractionTriggered(ctx, cmd.payload.interaction, cmd.correlationId);
}
