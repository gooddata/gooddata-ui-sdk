// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes";
import { UndoLayoutChanges } from "../../commands";
import { dispatchDashboardEvent } from "../../eventEmitter/eventDispatcher";
import { commandRejected } from "../../events/general";

export function* undoLayoutChangesHandler(ctx: DashboardContext, cmd: UndoLayoutChanges) {
    yield dispatchDashboardEvent(commandRejected(ctx, cmd.correlationId));
}
