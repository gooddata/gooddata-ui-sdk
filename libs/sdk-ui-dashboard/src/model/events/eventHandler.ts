// (C) 2021 GoodData Corporation
import { AnyAction, Dispatch } from "@reduxjs/toolkit";

import { DashboardState } from "../state/types";
import { ICustomDashboardEvent, isDashboardEvent } from "./base";
import { DashboardEvents } from "./index";

/**
 * Event handlers can be registered for a dashboard. All events that occur during dashboard processing will be
 * evaluated against all registered handlers and if evaluation succeeds they will be dispatched to the handler
 * function.
 *
 * @alpha
 */
export type DashboardEventHandler<TEvents extends DashboardEvents | ICustomDashboardEvent = any> = {
    /**
     * Specify event evaluation function. This will be used by dashboard's event emitter to determine
     * whether event of particular type should be dispatched to this handler.
     *
     * @param event - dashboard or custom event
     */
    eval: (event: DashboardEvents | ICustomDashboardEvent) => boolean;

    /**
     * The actual event handling function. This will be called if the eval function returns true.
     *
     * @param event - event to handle
     * @param dashboardDispatch - the dispatch object of the dashboard store use dot dispatch commands or queries
     * @param stateSelect - callback to execute arbitrary selectors against the dashboard state
     */
    handler: (
        event: TEvents,
        dashboardDispatch: Dispatch<AnyAction>,
        stateSelect: DashboardSelectorEvaluator,
    ) => void;
};

/**
 * Creates a {@link DashboardEventHandler} instance that will be invoked for any event (event for custom events).
 *
 * @param handler - the actual event handling function
 * @alpha
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
 * @alpha
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
 * @alpha
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
 * Function that selects part of the Dashboard state.
 *
 * @alpha
 */
export type DashboardSelector<TResult> = (state: DashboardState) => TResult;

/**
 * Type of a callback that evaluates a selector function against the Dashboard state
 *
 * @alpha
 */
export type DashboardSelectorEvaluator = <TResult>(selector: DashboardSelector<TResult>) => TResult;
