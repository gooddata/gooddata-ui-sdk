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

    const isInitialized = React.useRef(false);

    const addMessages = React.useCallback(
        (messagesToAdd: IMessage[]) => {
            toastsCenterRef.current.addExistingMessages(
                messagesToAdd.map((message) => ({
                    ...message,
                    onDismiss: () => dismissHandlerRef.current(message.id),
                })),
            );
        },
        [dismissHandlerRef, toastsCenterRef],
    );

    React.useEffect(() => {
        if (isInitialized.current) {
            return;
        }

        addMessages(messages);
        isInitialized.current = true;
    }, [addMessages, messages]);

    // Remove messages that are not in the new list
    const messagesToRemove = React.useMemo(
        () =>
            previousMessages.filter(
                (message) => !messages.some((newMessage) => newMessage.id === message.id),
            ),
        [previousMessages, messages],
    );
    React.useEffect(() => {
        messagesToRemove.forEach((message) => toastsCenterRef.current.removeMessage(message.id));
    }, [messagesToRemove, toastsCenterRef]);

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

    return null;
}
