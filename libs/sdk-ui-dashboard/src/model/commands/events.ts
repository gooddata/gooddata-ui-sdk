// (C) 2021 GoodData Corporation

import { DashboardEventBody, ICustomDashboardEvent, IDashboardEvent } from "../events/base";
import { IDashboardCommand } from "./base";

/**
 * Triggers an event.
 *
 * @alpha
 */
export interface TriggerEvent extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.EVENT.TRIGGER";
    readonly payload: {
        /**
         * Event body without the {@link DashboardContext} property. That will be filled when the command is processed.
         */
        readonly eventBody: DashboardEventBody<IDashboardEvent | ICustomDashboardEvent>;
    };
}

/**
 * Creates an {@link TriggerEvent} event.
 *
 * @alpha
 */
export function triggerEvent(
    eventBody: DashboardEventBody<IDashboardEvent | ICustomDashboardEvent>,
    correlationId?: string,
): TriggerEvent {
    return {
        type: "GDC.DASH/CMD.EVENT.TRIGGER",
        correlationId,
        payload: {
            eventBody,
        },
    };
}
