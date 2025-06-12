// (C) 2021-2023 GoodData Corporation
import React, { createContext, useCallback, useState } from "react";
import { IMessage, IMessageDefinition } from "./typings.js";

/**
 * @internal
 */
export interface ToastMessageContextType {
    messages: IMessage[];
    removeMessage: (id: string) => void;
    removeAllMessages: () => void;
    addMessage: (message: IMessageDefinition) => string;
}

/**
 * @internal
 */
export const ToastMessageContext = createContext<ToastMessageContextType>({
    messages: [],
    removeMessage: () => {
        /*do nothing*/
    },
    removeAllMessages: () => {
        /*do nothing*/
    },
    addMessage: () => {
        /*do nothing*/
        return "";
    },
});

let idCounter = 0;
const DEFAULT_DURATION = 2500;

/**
 * @internal
 */
export const ToastMessageContextProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const [messages, setMessages] = useState<IMessage[]>([]);

    const removeMessage = useCallback((id: string) => {
        setMessages((prevMessages) => prevMessages.filter((message) => message.id !== id));
    }, []);

    const removeAllMessages = useCallback(() => {
        setMessages([]);
    }, []);

    const addMessage = useCallback(
        (message: IMessageDefinition) => {
            const id = (++idCounter).toString(10);
            const newMessage = {
                ...message,
                id,
            };
            setMessages((prevMessages) => [...prevMessages, newMessage]);

            const duration = message.duration ?? DEFAULT_DURATION;
            if (duration) {
                setTimeout(() => {
                    removeMessage(newMessage.id);
                }, duration);
            }

            return id;
        },
        [removeMessage],
    );

    return (
        <ToastMessageContext.Provider value={{ messages, removeMessage, removeAllMessages, addMessage }}>
            {children}
        </ToastMessageContext.Provider>
    );
};
