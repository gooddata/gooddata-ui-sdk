// (C) 2025 GoodData Corporation
import React from "react";

import { useIntl } from "react-intl";

import { ToastsCenterContext, useToastsCenterValue } from "./context.js";
import { MessageElement, ToastMessageList } from "./ToastsCenterMessage.js";
import { Overlay } from "../../Overlay/index.js";
import { IMessage } from "../typings.js";

/**
 * Displays the toasts messages in the current context.
 * Only the topmost context will render any content. If this is in a child context, nothing will be displayed.
 *
 * @internal
 */
export function ToastsCenter() {
    const { messages, latestMessage, removeMessage, hasParentContext } = ToastsCenterContext.useContextStore(
        (ctx) => ({
            messages: ctx.messages,
            removeMessage: ctx.removeMessage,
            hasParentContext: ctx.hasParentContext,
            latestMessage: ctx.latestMessage,
        }),
    );

    const sortedMessages = React.useMemo(
        () => [...messages].sort((a, b) => b.createdAt - a.createdAt),
        [messages],
    );

    const label = useMessagesLabel(messages);

    if (hasParentContext) {
        return null;
    }

    return (
        <>
            <div className={"sr-only"} role={"status"} aria-live={"polite"} aria-atomic={"true"}>
                {latestMessage ? <MessageElement message={latestMessage} type={"span"} /> : null}
            </div>

            <Overlay>
                <div className="gd-messages" role={"region"} aria-label={label}>
                    <ToastMessageList messages={sortedMessages} onRemoveMessage={removeMessage} />
                </div>
            </Overlay>
        </>
    );
}

function useMessagesLabel(messages: IMessage[]) {
    const { formatMessage } = useIntl();

    const numTotal = messages.length;
    const numErrors = messages.filter((message) => message.type === "error").length;
    const numWarnings = messages.filter((message) => message.type === "warning").length;
    const numSuccess = messages.filter((message) => message.type === "success").length;
    const numProgress = messages.filter((message) => message.type === "progress").length;

    if (numTotal === 0) {
        return formatMessage({ id: "messages.accessibility.noMessages" });
    }

    const errorMessage = formatMessage({ id: "messages.accessibility.partial.error" }, { count: numErrors });
    const warningMessage = formatMessage(
        { id: "messages.accessibility.partial.warning" },
        { count: numWarnings },
    );
    const successMessage = formatMessage(
        { id: "messages.accessibility.partial.success" },
        { count: numSuccess },
    );
    const progressMessage = formatMessage(
        { id: "messages.accessibility.partial.progress" },
        { count: numProgress },
    );

    return formatMessage(
        { id: "messages.accessibility.label" },
        {
            count: numTotal,
            partial: [
                numErrors && errorMessage,
                numWarnings && warningMessage,
                numSuccess && successMessage,
                numProgress && progressMessage,
            ]
                .filter(Boolean)
                .join(", "),
        },
    );
}

/**
 * Provides a context for managing toasts messages.
 * If there is no parent toasts context in the tree, it will also render the messages.
 *
 * @internal
 */
export function ToastsCenterContextProvider({ children }: { children: React.ReactNode }) {
    return (
        <ToastsCenterContext value={useToastsCenterValue()}>
            <ToastsCenter />
            {children}
        </ToastsCenterContext>
    );
}
