// (C) 2021-2026 GoodData Corporation

import { type AnyAction, type Dispatch } from "@reduxjs/toolkit";

import { type IDashboardCommand } from "../commands/index.js";
import {
    type DashboardEvents,
    type ICustomDashboardEvent,
    type IDashboardCommandFailed,
    type IDashboardCommandStarted,
    isDashboardCommandFailed,
    isDashboardCommandStarted,
    isDashboardEvent,
} from "../events/index.js";
import { type DashboardSelectorEvaluator } from "../store/types.js";

/**
 * @public
 */
export type DashboardEventHandlerFn<TEvents extends DashboardEvents | ICustomDashboardEvent> = (
    event: TEvents,
    dashboardDispatch: Dispatch<AnyAction>,
    stateSelect: DashboardSelectorEvaluator,
) => void;

/**
 * @public
 */
export type DashboardEventEvalFn = (event: DashboardEvents | ICustomDashboardEvent) => boolean;

/**
 * Event handlers can be registered for a dashboard.
 *
 * @remarks
 * All events that occur during dashboard processing will be evaluated against all registered handlers and if
 * evaluation succeeds they will be dispatched to the handler function.
 *
 * @public
 */
export type DashboardEventHandler<TEvents extends DashboardEvents | ICustomDashboardEvent = any> = {
    /**
     * Specify event evaluation function.
     *
     * @remarks
     * This will be used by dashboard's event emitter to determine
     * whether event of particular type should be dispatched to this handler.
     *
     * @param event - dashboard or custom event
     */
    eval: DashboardEventEvalFn;

    /**
     * The actual event handling function.
     *
     * @remarks
     * This will be called if the eval function returns true.
     *
     * @param event - event to handle
     * @param dashboardDispatch - the dispatch object of the dashboard store use dot dispatch commands or queries
     * @param stateSelect - callback to execute arbitrary selectors against the dashboard state
     */
    handler: DashboardEventHandlerFn<TEvents>;
};

/**
 * Creates a {@link DashboardEventHandler} instance that will be invoked for any event (event for custom events).
 *
 * @param handler - the actual event handling function
 * @public
 */
export function anyEventHandler(handler: DashboardEventHandler["handler"]): DashboardEventHandler {
    return {
        eval: () => true,
        handler,
    };
}

/**
 * Creates a {@link DashboardEventHandler} instance that will be invoked for any dashboard event (i.e. not for custom events).
 *
 * @param handler - the actual event handling function
 * @public
 */
export function anyDashboardEventHandler(handler: DashboardEventHandler["handler"]): DashboardEventHandler {
    return {
        eval: isDashboardEvent,
        handler,
    };
}

/**
 * Creates a {@link DashboardEventHandler} instance that will be invoked for one specified event type.
 *
 * @param type - the type of event this handler should trigger for
 * @param handler - the actual event handling function
 * @public
 */
export function singleEventTypeHandler(
    type: (DashboardEvents | ICustomDashboardEvent)["type"],
    handler: DashboardEventHandler["handler"],
): DashboardEventHandler {
    return {
        eval: (e) => e.type === type,
        handler,
    };
}

/**
 * Creates a {@link DashboardEventHandler} instance that will be invoked for a DashboardCommandStarted of a particular command.
 *
 * @param type - the type of command the DashboardCommandStarted of which this handler should trigger for
 * @param handler - the actual event handling function
 * @alpha
 */
export function commandStartedEventHandler<TCommand extends IDashboardCommand>(
    type: TCommand["type"],
    handler: DashboardEventHandler<IDashboardCommandStarted<TCommand>>["handler"],
): DashboardEventHandler<IDashboardCommandStarted<TCommand>> {
    return {
        eval: (e) => isDashboardCommandStarted(e) && e.payload.command.type === type,
        handler,
    };
}

/**
 * Creates a {@link DashboardEventHandler} instance that will be invoked for a DashboardCommandFailed of a particular command.
 *
 * @param type - the type of command the DashboardCommandFailed of which this handler should trigger for
 * @param handler - the actual event handling function
 * @alpha
 */
export function commandFailedEventHandler<TCommand extends IDashboardCommand>(
    type: TCommand["type"],
    handler: DashboardEventHandler<IDashboardCommandFailed<TCommand>>["handler"],
): DashboardEventHandler<IDashboardCommandFailed<TCommand>> {
    return {
        eval: (e) => isDashboardCommandFailed(e) && e.payload.command.type === type,
        handler,
    };
}
