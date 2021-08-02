// (C) 2021 GoodData Corporation
import { DashboardCommands } from "../commands";
import { DashboardState } from "../state/types";
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
     * @param evalSelector - callback to execute arbitrary selectors against the dashboard state
     */
    handler: (
        event: TEvents,
        dispatchCommand: (command: DashboardCommands) => void,
        evalSelector: DashboardSelectorEvaluator,
    ) => void;
};

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
