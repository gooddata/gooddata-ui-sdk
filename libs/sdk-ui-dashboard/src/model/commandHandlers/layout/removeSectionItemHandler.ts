// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes";
import { RemoveSectionItem } from "../../commands";
import { dispatchDashboardEvent } from "../../eventEmitter/eventDispatcher";
import { commandRejected } from "../../events/general";

export function* removeSectionItemHandler(ctx: DashboardContext, cmd: RemoveSectionItem) {
    yield dispatchDashboardEvent(commandRejected(ctx, cmd.correlationId));
}
