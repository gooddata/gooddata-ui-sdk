// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes";
import { ChangeLayoutSectionHeader } from "../../commands";
import { dispatchDashboardEvent } from "../../eventEmitter/eventDispatcher";
import { commandRejected } from "../../events/general";

export function* changeLayoutSectionHeaderHandler(ctx: DashboardContext, cmd: ChangeLayoutSectionHeader) {
    yield dispatchDashboardEvent(commandRejected(ctx, cmd.correlationId));
}
