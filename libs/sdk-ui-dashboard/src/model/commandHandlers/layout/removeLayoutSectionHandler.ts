// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { DashboardContext } from "../../types/commonTypes";
import { RemoveLayoutSection } from "../../commands";
import { dispatchDashboardEvent } from "../../eventEmitter/eventDispatcher";
import { commandRejected } from "../../events/general";

export function* removeLayoutSectionHandler(
    ctx: DashboardContext,
    cmd: RemoveLayoutSection,
): SagaIterator<void> {
    yield dispatchDashboardEvent(commandRejected(ctx, cmd.correlationId));
}
