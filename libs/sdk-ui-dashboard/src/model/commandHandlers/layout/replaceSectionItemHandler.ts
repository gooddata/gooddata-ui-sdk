// (C) 2021 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes";
import { ReplaceSectionItem } from "../../commands";
import { dispatchDashboardEvent } from "../../eventEmitter/eventDispatcher";
import { commandRejected } from "../../events/general";

export function* replaceSectionItemHandler(ctx: DashboardContext, cmd: ReplaceSectionItem) {
    yield dispatchDashboardEvent(commandRejected(ctx, cmd.correlationId));
}
