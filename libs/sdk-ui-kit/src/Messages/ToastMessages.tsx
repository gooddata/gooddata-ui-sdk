// (C) 2021-2025 GoodData Corporation
import React, { useContext } from "react";
import { ToastMessageContext } from "./ToastMessageContext.js";
import { MessageElement, Messages } from "./Messages.js";

/**
 * @internal
 */
export const ToastMessages: React.FC = () => {
    const { messages, removeMessage } = useContext(ToastMessageContext);

    const lastMessageRef = React.useRef(undefined);
    lastMessageRef.current = messages[messages.length - 1] ?? lastMessageRef.current;

    return (
        <>
            <Messages messages={messages} onMessageClose={removeMessage} regionEnabled />

            <div className={"sr-only"} role={"status"} aria-live={"polite"} aria-atomic={"true"}>
                {lastMessageRef.current ? (
                    <MessageElement message={lastMessageRef.current} type={"span"} />
                ) : null}
            </div>
        </>
    );
};
