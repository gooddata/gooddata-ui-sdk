// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes";
import { MoveLayoutSection } from "../../commands";
import { dispatchDashboardEvent } from "../../eventEmitter/eventDispatcher";
import { commandRejected } from "../../events/general";

export function* moveLayoutSectionHandler(ctx: DashboardContext, cmd: MoveLayoutSection) {
    yield dispatchDashboardEvent(commandRejected(ctx, cmd.correlationId));
}
