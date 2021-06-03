// (C) 2020-2021 GoodData Corporation
import { useDashboardDispatch } from "../model/state/dashboardStore";
import { useDashboardEventsContext } from "../dashboard/DashboardEventsContext";
import { DashboardEventHandler } from "../model/events/eventHandler";
import { v4 as uuid } from "uuid";
import { DashboardEventType, DashboardCommands, DashboardEvents } from "../model";

/**
 * Hook that takes command creator and event handlers and returns function
 * that will result into dispatching this command, registering the event handlers,
 * and unregistering them once event type with the same type and correlation ID is triggered.
 *
 * If no correlationId is provided, it's auto-generated.

 * @param commandCreator - command factory
 * @param eventHandlers - record with eventTypes as keys and relevant callbacks as values
 * @param onBeforeRun - optionally provide callback that will be called before dispatching the command
 * @returns callback that dispatches the command, registers relevant event handlers and unregisters them
 *          when an event that matches the correlation ID and one of the specified event types occurs
 * @internal
 */
export const useDashboardCommand = <TCommand extends DashboardCommands, TArgs extends any[]>(
    commandCreator: (...args: TArgs) => TCommand,
    eventHandlers: {
        [eventType in DashboardEventType]?: <T extends Extract<DashboardEvents, { type: eventType }>>(
            event: T,
        ) => void;
    },
    onBeforeRun: () => void,
): ((...args: TArgs) => void) => {
    const dispatch = useDashboardDispatch();
    const { registerHandler, unregisterHandler } = useDashboardEventsContext();

    const run = (...args: TArgs) => {
        let command = commandCreator(...args);

        const correlationId = command.correlationId ?? uuid();

        if (!command.correlationId) {
            command = {
                ...command,
                correlationId,
            };
        }

        const dashboardEventHandlers = Object.keys(eventHandlers).map((eventType) => {
            const dashboardEventHandler: DashboardEventHandler = {
                eval: (eT) => eT === eventType,
                handler: (event) => {
                    if (event.correlationId === correlationId) {
                        unregisterHandlers();
                        eventHandlers[eventType](event);
                    }
                },
            };

            return dashboardEventHandler;
        });

        dashboardEventHandlers.forEach((handler) => {
            registerHandler(handler);
        });

        function unregisterHandlers() {
            dashboardEventHandlers.forEach((handler) => {
                unregisterHandler(handler);
            });
        }

        onBeforeRun?.();
        dispatch(command);
    };

    return run;
};
