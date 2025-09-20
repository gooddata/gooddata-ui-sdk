// (C) 2024-2025 GoodData Corporation

import { useEffect } from "react";

import { isEmpty } from "lodash-es";
import { MessageDescriptor } from "react-intl";

import { MessageParameters, useToastMessage } from "@gooddata/sdk-ui-kit";

import {
    DashboardEventEvalFn,
    DashboardEventHandler,
    DashboardEvents,
    ICustomDashboardEvent,
    useDashboardEventsContext,
} from "../../model/index.js";

export function isMessageDescriptor(obj: unknown): obj is MessageDescriptor {
    return !isEmpty(obj) && (obj as MessageDescriptor).id !== undefined;
}

export function isMessageParameters(obj: unknown): obj is MessageParameters {
    return (
        !isEmpty(obj) &&
        ((obj as MessageParameters).values !== undefined ||
            (obj as MessageParameters).duration !== undefined ||
            (obj as MessageParameters).intensive !== undefined)
    );
}

/**
 * Hook that registers (and unregisters on the hook unmount) command event listener that emits toast
 * messages into the message context based on the events it listens to.
 *
 * All the provided parameters below should have a stable reference and should not change between hook
 * re-renders otherwise the listener could be registered multiple times!
 *
 * @param type - type of toast message that should be emitted.
 * @param evaluator - evaluator to test the event we are listening to.
 * @param messageDescriptor - toast message descriptor or function that receives the matching event and produces the toast message descriptor.
 * @param messageParameters - optional message parameters or function that receives the matching event and produces the message parameters.
 */
export const useEventToastMessage = <TEvents extends DashboardEvents | ICustomDashboardEvent>(
    type: "success" | "warning" | "error",
    evaluator: DashboardEventEvalFn,
    messageDescriptor: MessageDescriptor | ((event: TEvents) => MessageDescriptor),
    messageParameters?: MessageParameters | ((event: TEvents) => MessageParameters),
) => {
    const { registerHandler, unregisterHandler } = useDashboardEventsContext();
    const { addSuccess, addWarning, addError } = useToastMessage();

    useEffect(() => {
        const onEvent: DashboardEventHandler = {
            eval: evaluator,
            handler: (cmd: TEvents) => {
                const message = isMessageDescriptor(messageDescriptor)
                    ? messageDescriptor
                    : messageDescriptor(cmd);
                const parameters =
                    messageParameters === undefined
                        ? undefined
                        : isMessageParameters(messageParameters)
                          ? messageParameters
                          : messageParameters(cmd);
                switch (type) {
                    case "success":
                        addSuccess(message, parameters);
                        return;
                    case "warning":
                        addWarning(message, parameters);
                        return;
                    case "error":
                    default:
                        addError(message, parameters);
                        return;
                }
            },
        };
        registerHandler(onEvent);

        return () => {
            unregisterHandler(onEvent);
        };
    }, [
        registerHandler,
        unregisterHandler,
        addSuccess,
        addWarning,
        addError,
        type,
        messageDescriptor,
        messageParameters,
        evaluator,
    ]);
};
