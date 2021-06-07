// (C) 2021 GoodData Corporation

import { DashboardContext } from "../../types/commonTypes";
import { AddLayoutSection } from "../../commands";
import { dispatchDashboardEvent } from "../../eventEmitter/eventDispatcher";
import { commandRejected } from "../../events/general";

export function* addLayoutSectionHandler(ctx: DashboardContext, cmd: AddLayoutSection) {
    yield dispatchDashboardEvent(commandRejected(ctx, cmd.correlationId));
}
