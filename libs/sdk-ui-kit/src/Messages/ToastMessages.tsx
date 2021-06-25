import React, { useContext } from "react";
import { ToastMessageContext } from "./ToastMessageContext";
import { Messages } from "./Messages";

/**
 * @public
 */
export const ToastMessages: React.FC = () => {
    const { messages, removeMessage } = useContext(ToastMessageContext);

    if (messages.length > 0) {
        return <Messages messages={messages} onMessageClose={removeMessage} />;
    }
    return null;
};
