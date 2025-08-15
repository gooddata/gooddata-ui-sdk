// (C) 2021-2025 GoodData Corporation
import React, { useContext } from "react";
import { ToastMessageContext } from "./ToastMessageContext.js";
import { Messages } from "./Messages.js";

/**
 * @internal
 */
export const ToastMessages: React.FC = () => {
    const { messages, removeMessage } = useContext(ToastMessageContext);

    return <Messages messages={messages} onMessageClose={removeMessage} regionEnabled />;
};
