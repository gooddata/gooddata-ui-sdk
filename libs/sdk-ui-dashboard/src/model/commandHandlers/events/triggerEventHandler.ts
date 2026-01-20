// (C) 2021-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";

import { type ITriggerEvent } from "../../commands/index.js";
import { type DashboardEvents, type ICustomDashboardEvent } from "../../events/index.js";
import { dispatchDashboardEvent } from "../../store/_infra/eventDispatcher.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* triggerEventHandler(ctx: DashboardContext, cmd: ITriggerEvent): SagaIterator<void> {
    // fill the ctx property of the event properly so that the caller does not need to do this
    const fullEvent: DashboardEvents | ICustomDashboardEvent = {
        ...cmd.payload.eventBody,
        ctx,
    };

    yield dispatchDashboardEvent(fullEvent);
}
