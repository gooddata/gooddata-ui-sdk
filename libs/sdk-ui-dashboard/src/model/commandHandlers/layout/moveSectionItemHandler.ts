// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes";
import { MoveSectionItem } from "../../commands";
import { dispatchDashboardEvent } from "../../eventEmitter/eventDispatcher";
import { commandRejected } from "../../events/general";

export function* moveSectionItemHandler(ctx: DashboardContext, cmd: MoveSectionItem) {
    yield dispatchDashboardEvent(commandRejected(ctx, cmd.correlationId));
}
