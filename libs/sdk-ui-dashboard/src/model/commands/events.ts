// (C) 2021-2026 GoodData Corporation

import { type IDashboardCommand } from "./base.js";
import { type DashboardEventBody, type ICustomDashboardEvent, type IDashboardEvent } from "../events/base.js";

/**
 * Payload of the {@link ITriggerEvent} command.
 * @beta
 */
export interface ITriggerEventPayload {
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
export interface ITriggerEvent extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.EVENT.TRIGGER";
    readonly payload: ITriggerEventPayload;
}

/**
 * Creates an {@link ITriggerEvent} command.
 *
 * @beta
 */
export function triggerEvent(
    eventBody: DashboardEventBody<IDashboardEvent | ICustomDashboardEvent>,
    correlationId?: string,
): ITriggerEvent {
    return {
        type: "GDC.DASH/CMD.EVENT.TRIGGER",
        correlationId,
        payload: {
            eventBody,
        },
    };
}
