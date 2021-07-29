// (C) 2020-2021 GoodData Corporation
import { useCallback } from "react";
import { v4 as uuid } from "uuid";

import { DashboardEvents } from "../events";
import { DashboardEventHandler } from "../events/eventHandler";
import { DashboardQueries } from "../queries";

import { useDashboardEventsContext } from "./DashboardEventsContext";
import { useDashboardDispatch } from "./DashboardStoreProvider";

/**
 * Hook that takes query creator and event handlers and returns function
 * that will result into dispatching this query, registering the event handlers,
 * and unregistering them once event type with the same type and correlation ID is triggered.
 *
 * If no correlationId is provided, it's auto-generated.

 * @param queryCreator - query factory
 * @param eventHandlers - record with eventTypes as keys and relevant callbacks as values
 * @param onBeforeRun - optionally provide callback that will be called before dispatching the query
 * @returns callback that dispatches the query, registers relevant event handlers and unregisters them
 *          when an event that matches the correlation ID and one of the specified event types occurs
 * @alpha
 */
export const useDashboardQuery = <TQuery extends DashboardQueries, TArgs extends any[]>(
    queryCreator: (...args: TArgs) => TQuery,
    eventHandlers?: {
        [eventType in
            | "GDC.DASH/EVT.QUERY.FAILED"
            | "GDC.DASH/EVT.QUERY.REJECTED"
            | "GDC.DASH/EVT.QUERY.STARTED"
            | "GDC.DASH/EVT.QUERY.COMPLETED"]?: (
            event: Extract<DashboardEvents, { type: eventType }>,
        ) => void;
    },
    onBeforeRun?: (command: TQuery) => void,
): ((...args: TArgs) => void) => {
    const dispatch = useDashboardDispatch();
    const { registerHandler, unregisterHandler } = useDashboardEventsContext();

    const run = useCallback((...args: TArgs) => {
        let query = queryCreator(...args);

        const correlationId = query.correlationId ?? uuid();

        if (!query.correlationId) {
            query = {
                ...query,
                correlationId,
            };
        }

        const dashboardEventHandlers = eventHandlers
            ? Object.keys(eventHandlers).map((eventType) => {
                  const dashboardEventHandler: DashboardEventHandler = {
                      eval: (eT) => eT.type === eventType,
                      handler: (event) => {
                          if (event.correlationId === correlationId) {
                              unregisterHandlers();
                              eventHandlers[eventType](event);
                          }
                      },
                  };

                  return dashboardEventHandler;
              })
            : [];

        dashboardEventHandlers.forEach((handler) => {
            registerHandler(handler);
        });

        function unregisterHandlers() {
            dashboardEventHandlers.forEach((handler) => {
                unregisterHandler(handler);
            });
        }

        onBeforeRun?.(query);
        dispatch(query);
    }, []);

    return run;
};
