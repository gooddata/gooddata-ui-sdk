// (C) 2021-2025 GoodData Corporation

import { IDashboardCommand } from "./base.js";
import { DashboardEventBody, ICustomDashboardEvent, IDashboardEvent } from "../events/base.js";

/**
 * Payload of the {@link TriggerEvent} command.
 * @beta
 */
export interface TriggerEventPayload {
    /**
     * Event body without the {@link DashboardContext} property. That will be filled when the command is processed.
     */
    readonly eventBody: DashboardEventBody<IDashboardEvent | ICustomDashboardEvent>;
}

/**
 * Triggers an event.
 *
 * @beta
 */
export interface TriggerEvent extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.EVENT.TRIGGER";
    readonly payload: TriggerEventPayload;
}

/**
 * Creates an {@link TriggerEvent} command.
 *
 * @beta
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
