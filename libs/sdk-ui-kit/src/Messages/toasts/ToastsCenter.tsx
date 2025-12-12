// (C) 2025 GoodData Corporation

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { useIntl } from "react-intl";

import { ToastsCenterContext, useToastsCenterValue } from "./context.js";
import { ToastMessageList } from "./ToastsCenterMessage.js";
import { Overlay } from "../../Overlay/index.js";
import { type IMessage } from "../typings.js";

/**
 * Displays the toasts messages in the current context.
 * Only the topmost context will render any content. If this is in a child context, nothing will be displayed.
 *
 * @internal
 */
export function ToastsCenter() {
    const { messages, removeMessage, hasParentContext } = ToastsCenterContext.useContextStoreValues([
        "messages",
        "removeMessage",
        "hasParentContext",
    ]);

    const sortedMessages = useMemo(() => [...messages].sort((a, b) => b.createdAt - a.createdAt), [messages]);

    const label = useMessagesLabel(messages);

    if (hasParentContext) {
        return null;
    }

    return (
        <>
            <ScreenReaderToast />

            <Overlay>
                <div className="gd-messages" role={"region"} aria-label={label}>
                    <ToastMessageList messages={sortedMessages} onRemoveMessage={removeMessage} />
                </div>
            </Overlay>
        </>
    );
}

/**
 * Stores the latest message for the screen reader to read
 * @internal
 */
export function ScreenReaderToast() {
    const latestMessage = ToastsCenterContext.useContextStoreOptional((ctx) => ctx.latestMessage);
    const messageForScreenReader = useMessageForScreenReader(latestMessage);

    return (
        <div className={"sr-only"} role={"status"} aria-live={"polite"} aria-atomic={"true"}>
            {messageForScreenReader}
        </div>
    );
}

// Our silent characters: different kinds of spaces. See https://en.wikipedia.org/wiki/Whitespace_character.
const SILENT_CHARACTERS = [" ", " ", " ", " ", " ", " "];
let silentCharIndex = 0;
function augmentWithSilentCharacter(text: string) {
    silentCharIndex = (silentCharIndex + 1) % SILENT_CHARACTERS.length;
    return `${text}${SILENT_CHARACTERS[silentCharIndex++]}`;
}

const MESSAGE_FRESH_TIME = 1000; // ms

/**
 * There is a problem with screen readers when multiple toasts are fired in a row with the same message.
 * To get the screen reader to read the repeated message, we need to add a silent character to the end of the message.
 * We cycle through the silent characters to make sure each new message is unique to the one before it.
 */
function useMessageForScreenReader(message: IMessage | null | undefined) {
    const [displayedMessage, setDisplayedMessage] = useState("");
    // Do not read the old existing message on the first render.
    // There is an exception to this, if the message is fresh, we still want to read it.
    // This can happen when a new message is added and a new dialog is opened immediately.
    // If we didn't do this, the message would not be read.
    const isMessageFresh = !!message && message?.createdAt > Date.now() - MESSAGE_FRESH_TIME;
    const shouldReadMessage = useRef(isMessageFresh);
    shouldReadMessage.current = shouldReadMessage.current || isMessageFresh;

    useEffect(() => {
        if (!message) {
            return;
        }
        if (!shouldReadMessage.current) {
            shouldReadMessage.current = true;
            return;
        }

        // Support both text and node content for screen readers
        // when we pass parameters (like count), the toast system stores the formatted content in message.node instead.
        const messageContent = message.text || (typeof message.node === "string" ? message.node : "");
        setDisplayedMessage(augmentWithSilentCharacter(messageContent));
    }, [message]);

    return displayedMessage;
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
export function ToastsCenterContextProvider({
    skipAutomaticMessageRendering,
    children,
}: {
    skipAutomaticMessageRendering?: boolean;
    children: ReactNode;
}) {
    return (
        <ToastsCenterContext value={useToastsCenterValue()}>
            {skipAutomaticMessageRendering ? null : <ToastsCenter />}

            {children}
        </ToastsCenterContext>
    );
}
