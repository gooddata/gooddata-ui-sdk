// (C) 2025 GoodData Corporation
import React from "react";

import { useAutoupdateRef, usePrevious } from "@gooddata/sdk-ui";

import { ToastsCenterContext } from "./context.js";
import { ToastsCenterContextProvider } from "./ToastsCenter.js";
import { IMessage } from "../typings.js";

/**
 * Allows displaying messages coming from outside the toasts context system.
 * If no parent context is found, this component will create one.
 *
 * @internal
 */
export function NonContextToastsInterop(props: {
    messages: IMessage[];
    onDismissMessage?: (id: IMessage["id"]) => void;
}) {
    const hasContext = ToastsCenterContext.useContextStoreOptional(() => true);

    if (hasContext) {
        return <NonContextToastsInteropInner {...props} />;
    }

    return (
        <ToastsCenterContextProvider>
            <NonContextToastsInteropInner {...props} />
        </ToastsCenterContextProvider>
    );
}

function NonContextToastsInteropInner({
    messages,
    onDismissMessage,
}: {
    messages: IMessage[];
    onDismissMessage?: (id: IMessage["id"]) => void;
}) {
    const toastsCenter = ToastsCenterContext.useContextStore((ctx) => ctx);
    const toastsCenterRef = useAutoupdateRef(toastsCenter);

    const dismissHandlerRef = useAutoupdateRef(onDismissMessage);

    const previousMessages = usePrevious(messages);
    const messagesRef = useAutoupdateRef(messages);

    const isInitialized = React.useRef(false);

    const addMessages = React.useCallback(
        (messagesToAdd: IMessage[]) => {
            toastsCenterRef.current.addExistingMessages(
                messagesToAdd.map((message) => ({
                    ...message,
                    // Messages from Redux usually do not specify a duration and want to be displayed until dismissed.
                    // Some cases handle the duration in Redux and dismiss from there.
                    duration: message.duration ?? Infinity,
                    onDismiss: () => {
                        dismissHandlerRef.current(message.id);
                        message.onDismiss?.();
                    },
                })),
            );
        },
        [dismissHandlerRef, toastsCenterRef],
    );

    const removeMessages = React.useCallback(
        (messagesToRemove: IMessage[]) => {
            messagesToRemove.forEach((message) => toastsCenterRef.current.removeMessage(message.id));
        },
        [toastsCenterRef],
    );

    // Add my messages to the toasts center on mount
    // Remove my messages from the toasts center on unmount
    React.useEffect(() => {
        if (isInitialized.current) {
            return undefined;
        }

        addMessages(messagesRef.current);
        isInitialized.current = true;

        return () => {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            removeMessages(messagesRef.current);
        };
    }, [addMessages, messagesRef, removeMessages]);

    // Remove messages that are not in the new list
    const messagesToRemove = React.useMemo(
        () =>
            previousMessages.filter(
                (message) => !messages.some((newMessage) => newMessage.id === message.id),
            ),
        [previousMessages, messages],
    );
    React.useEffect(() => {
        removeMessages(messagesToRemove);
    }, [messagesToRemove, removeMessages, toastsCenterRef]);

    // Add messages that are in the new list but not in the previous list
    const messagesToAdd = React.useMemo(
        () =>
            messages.filter(
                (message) => !previousMessages.some((previousMessage) => previousMessage.id === message.id),
            ),
        [messages, previousMessages],
    );
    React.useEffect(() => {
        addMessages(messagesToAdd);
    }, [messagesToAdd, addMessages]);

    // Replace messages that are in both lists but have different references
    const messagesToReplace = React.useMemo(
        () =>
            messages.filter((message) => {
                const previousMessage = previousMessages.find(
                    (previousMessage) => previousMessage.id === message.id,
                );
                return !!previousMessage && previousMessage !== message;
            }),
        [messages, previousMessages],
    );
    React.useEffect(() => {
        addMessages(messagesToReplace);
    }, [addMessages, messagesToReplace]);

    return null;
}
