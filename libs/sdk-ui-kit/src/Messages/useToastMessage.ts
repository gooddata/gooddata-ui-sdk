// (C) 2021-2022 GoodData Corporation

import { useContext } from "react";
import { MessageDescriptor, useIntl } from "react-intl";
import { ToastMessageContext } from "./ToastMessageContext.js";
import { IMessageDefinition, MessageType } from "./typings.js";

/**
 * @internal
 */
export type AddMessageType = (
    message: MessageDescriptor,
    options?: Pick<IMessageDefinition, "duration" | "intensive" | "values">,
) => string;

/**
 * @internal
 */
export interface UseToastMessageType {
    addSuccess: AddMessageType;
    addProgress: AddMessageType;
    addWarning: AddMessageType;
    addError: AddMessageType;
    removeMessage: (id: string) => void;
    removeAllMessages: () => void;
}

/**
 * @internal
 */
export const useToastMessage = (): UseToastMessageType => {
    const { addMessage, removeMessage, removeAllMessages } = useContext(ToastMessageContext);
    const intl = useIntl();

    const addMessageBase =
        (type: MessageType): AddMessageType =>
        (message, options) => {
            if (options?.values) {
                return addMessage({ ...options, type, node: intl.formatMessage(message, options.values) });
            }
            return addMessage({ ...options, type, text: intl.formatMessage(message) });
        };

    const addSuccess = addMessageBase("success");
    const addProgress = addMessageBase("progress");
    const addWarning = addMessageBase("warning");
    const addError = addMessageBase("error");

    return {
        addSuccess,
        addProgress,
        addWarning,
        addError,
        removeMessage,
        removeAllMessages,
    };
};
