// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes";
import { AddSectionItems } from "../../commands";
import { dispatchDashboardEvent } from "../../eventEmitter/eventDispatcher";
import { commandRejected } from "../../events/general";

export function* addSectionItemsHandler(ctx: DashboardContext, cmd: AddSectionItems) {
    yield dispatchDashboardEvent(commandRejected(ctx, cmd.correlationId));
}
