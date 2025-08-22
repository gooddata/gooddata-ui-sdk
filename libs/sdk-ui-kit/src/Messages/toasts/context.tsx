// (C) 2025 GoodData Corporation
import React from "react";

import { createContextStore, useAutoupdateRef } from "@gooddata/sdk-ui";

import { IMessage, IMessageDefinition } from "../typings.js";

const DEFAULT_DURATION = 2500;
let toastsCenterCounter = 0;

/**
 * @internal
 */
export type IToastsCenterContext = {
    /**
     * All messages that are currently displayed in the toasts center.
     */
    messages: IMessage[];
    /**
     * Removes a message from the toasts center.
     */
    removeMessage: (id: string, preventDismissHandler?: boolean) => void;
    /**
     * Removes all messages from the toasts center.
     */
    removeAllMessages: (preventDismissHandler?: boolean) => void;
    /**
     * Creates a new message from a definition and adds it to the toasts center.
     */
    addMessage: (message: IMessageDefinition) => IMessage;
    /**
     * Adds an existing message to the toasts center.
     */
    addExistingMessage: (message: IMessage) => void;
    /**
     * Adds an array of existing messages to the toasts center.
     */
    addExistingMessages: (messages: IMessage[]) => void;
    /**
     * The latest message that was added to the toasts center.
     */
    latestMessage: IMessage | null;
    /**
     * Whether there is a parent context or not.
     */
    hasParentContext: boolean;
};

/**
 * @internal
 */
export const ToastsCenterContext = createContextStore<IToastsCenterContext>("ToastsCenter");

/**
 * @internal
 */
export const useToastsCenterValue = (
    onDismissMessage?: (id: IMessage["id"]) => void,
): IToastsCenterContext => {
    const [toastsCenterId] = React.useState(`toasts-${toastsCenterCounter++}`);
    const toastCounterRef = React.useRef(0);

    const [messages, setMessages] = React.useState<IMessage[]>([]);
    const [latestMessage, setLatestMessage] = React.useState<IMessage | null>(null);

    const parentContext = ToastsCenterContext.useContextStoreOptional((ctx) => ctx);
    const parentContextRef = useAutoupdateRef(parentContext);
    const hasParentContext = !!parentContext;

    const dismissTimeoutsRef = React.useRef(new Set<number>());

    const dismissTimeouts = React.useCallback(() => {
        dismissTimeoutsRef.current.forEach((timeoutId) => {
            clearTimeout(timeoutId);
        });
    }, []);

    // Dismiss timeouts when the component unmounts
    React.useEffect(() => {
        return () => {
            dismissTimeouts();
        };
    }, [dismissTimeouts]);

    const messagesRef = useAutoupdateRef(messages);

    // When there is a new parent, transfer my messages to it and dismiss my timeouts
    // The parent will register its own timeouts
    // Known issue: The dismiss duration is reset on transferring to the parent.
    React.useEffect(() => {
        if (!hasParentContext) {
            return undefined;
        }

        parentContextRef.current?.addExistingMessages(messagesRef.current);
        setMessages(() => []);
        dismissTimeouts();
    }, [dismissTimeouts, hasParentContext, messagesRef, parentContextRef]);

    const removeMessage = React.useCallback(
        (id: IMessage["id"], preventDismissHandler?: boolean) => {
            setMessages((prev) => {
                const messageToRemove = prev.find((m) => m.id === id);

                if (!messageToRemove) {
                    return prev;
                }

                if (!preventDismissHandler) {
                    messageToRemove.onDismiss?.();
                    onDismissMessage?.(id);
                }

                return prev.filter((m) => m !== messageToRemove);
            });
        },
        [onDismissMessage],
    );

    const removeAllMessages = React.useCallback(
        (preventDismissHandler?: boolean) => {
            messages.forEach((message) => removeMessage(message.id, preventDismissHandler));
        },
        [messages, removeMessage],
    );

    const addExistingMessage = React.useCallback(
        (existingMessage: IMessage) => {
            removeMessage(existingMessage.id, true);

            setMessages((currentMessages) => [...currentMessages, existingMessage]);

            setLatestMessage((currentLatest) => {
                const currentLatestCreatedAt = currentLatest?.createdAt ?? -Infinity;

                return existingMessage.createdAt > currentLatestCreatedAt ? existingMessage : currentLatest;
            });

            const duration = existingMessage.duration ?? DEFAULT_DURATION;
            if (duration && isFinite(duration)) {
                const timeoutId = setTimeout(() => {
                    removeMessage(existingMessage.id);
                    dismissTimeoutsRef.current.delete(timeoutId as unknown as number);
                }, duration);

                dismissTimeoutsRef.current.add(timeoutId as unknown as number);
            }
        },
        [removeMessage],
    );

    const addExistingMessages = React.useCallback(
        (existingMessages: IMessage[]) => {
            existingMessages.forEach(addExistingMessage);
        },
        [addExistingMessage],
    );

    const addMessage = React.useCallback(
        (newMessage: IMessageDefinition) => {
            const createdMessage = {
                createdAt: new Date().getTime(),
                id: `${toastsCenterId}:${toastCounterRef.current++}`,
                ...newMessage,
            } satisfies IMessage;

            addExistingMessage(createdMessage);
            return createdMessage;
        },
        [addExistingMessage, toastsCenterId],
    );

    return {
        ...(parentContext ?? {
            messages,
            removeMessage,
            removeAllMessages,
            addMessage,
            addExistingMessage,
            addExistingMessages,
            latestMessage,
        }),
        hasParentContext,
    };
};
