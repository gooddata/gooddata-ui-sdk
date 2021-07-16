// (C) 2021 GoodData Corporation
import { DashboardCommands } from "../commands";
import { DashboardEvents } from "./index";

/**
 * Event handlers can be registered for a dashboard. All events that occur during dashboard processing will be
 * evaluated against all registered handlers and if evaluation succeeds they will be dispatched to the handler
 * function.
 *
 * @alpha
 */
export type DashboardEventHandler<TEvents extends DashboardEvents = any> = {
    /**
     * Specify event evaluation function. This will be used by dashboard's event emitter to determine
     * whether event of particular type should be dispatched to this handler.
     *
     * @param event - dashboard event
     */
    eval: (event: DashboardEvents) => boolean;

    /**
     * The actual event handling function. This will be called if the eval function returns true.
     *
     * @param event - event to handle
     * @param dispatchCommand - callback to dispatch any dashboard command
     */
    handler: (event: TEvents, dispatchCommand: (command: DashboardCommands) => void) => void;
};
