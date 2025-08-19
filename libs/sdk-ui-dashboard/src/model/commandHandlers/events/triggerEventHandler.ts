// (C) 2021-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";

import { TriggerEvent } from "../../commands/index.js";
import { DashboardEvents, ICustomDashboardEvent } from "../../events/index.js";
import { dispatchDashboardEvent } from "../../store/_infra/eventDispatcher.js";
import { DashboardContext } from "../../types/commonTypes.js";

export function* triggerEventHandler(ctx: DashboardContext, cmd: TriggerEvent): SagaIterator<void> {
    // fill the ctx property of the event properly so that the caller does not need to do this
    const fullEvent: DashboardEvents | ICustomDashboardEvent = {
        ...cmd.payload.eventBody,
        ctx,
    };

    yield dispatchDashboardEvent(fullEvent);
}
