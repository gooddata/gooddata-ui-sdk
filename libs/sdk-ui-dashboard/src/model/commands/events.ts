// (C) 2021-2022 GoodData Corporation

import { DashboardEventBody, ICustomDashboardEvent, IDashboardEvent } from "../events/base";
import { IDashboardCommand } from "./base";

/**
 * Payload of the {@link TriggerEvent} command.
 * @alpha
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
 * @alpha
 */
export interface TriggerEvent extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.EVENT.TRIGGER";
    readonly payload: TriggerEventPayload;
}

/**
 * Creates an {@link TriggerEvent} command.
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
