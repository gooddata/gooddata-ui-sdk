// (C) 2021 GoodData Corporation
import { DashboardEventType } from "./base";
import { DashboardEvents } from "./index";

/**
 * Event handlers can be registered for a dashboard. All events that occur during dashboard processing will be
 * evaluated against all registered handlers and if evaluation succeeds they will be dispatched to the handler
 * function.
 *
 * @internal
 */
export type DashboardEventHandler = {
    /**
     * Specify event type evaluation function. This will be used by dashboard's event emitter to determine
     * whether event of particular type should be dispatched to this handler.
     *
     * @param type - dashboard event type
     */
    eval: (type: DashboardEventType) => boolean;

    /**
     * The actual event handling function. This will be called if the eval function returns true.
     *
     * @param event - event to handle
     */
    handler: (event: DashboardEvents) => void;
};
