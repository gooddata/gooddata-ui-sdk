// (C) 2021-2025 GoodData Corporation
import { useContext } from "react";
import { ToastMessageContext } from "./ToastMessageContext.js";
import { Messages } from "./Messages.js";

/**
 * @internal
 */
export function ToastMessages() {
    const { messages, removeMessage } = useContext(ToastMessageContext);

    if (messages.length > 0) {
        return <Messages messages={messages} onMessageClose={removeMessage} />;
    }
    return null;
}
