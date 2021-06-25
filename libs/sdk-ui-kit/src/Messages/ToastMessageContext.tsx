import React, { createContext, useState } from "react";
import { IMessage } from "./typings";

/**
 * @public
 */
export type IMessageWithoutId = Omit<IMessage, "id">;

/**
 * @public
 */
export interface ToastMessageContextType {
    messages: IMessage[];
    removeMessage: (id: string) => void;
    addMessage: (message: IMessageWithoutId) => void;
}

/**
 * @public
 */
export const ToastMessageContext = createContext<ToastMessageContextType>({
    messages: [],
    removeMessage: () => {
        /*do nothing*/
    },
    addMessage: () => {
        /*do nothing*/
    },
});

let idCounter = 0;

/**
 * @public
 */
export const ToastMessageContextProvider: React.FC = ({ children }) => {
    const [messages, setMessages] = useState<IMessage[]>([]);

    const removeMessage = function (id: string) {
        setMessages((prevMessages) => prevMessages.filter((message) => message.id !== id));
    };

    const addMessage = function (message: IMessageWithoutId) {
        const newMessage = {
            ...message,
            id: (++idCounter).toString(10),
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);

        setTimeout(() => {
            removeMessage(newMessage.id);
        }, 2500);
    };

    return (
        <ToastMessageContext.Provider value={{ messages, removeMessage, addMessage }}>
            {children}
        </ToastMessageContext.Provider>
    );
};
