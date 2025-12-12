// (C) 2021-2025 GoodData Corporation

import { type MessageDescriptor, useIntl } from "react-intl";

import { ToastsCenterContext } from "./context.js";
import { type IMessage, type IMessageDefinition, type MessageType } from "../typings.js";

/**
 * @internal
 */
export type MessageParameters = Pick<
    IMessageDefinition,
    "duration" | "intensive" | "values" | "showMore" | "showLess" | "errorDetail" | "id"
>;

/**
 * @internal
 */
export type AddMessageType = (message: MessageDescriptor, options?: MessageParameters) => IMessage;

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
    const { addMessage, removeMessage, removeAllMessages } = ToastsCenterContext.useContextStoreValues([
        "addMessage",
        "removeMessage",
        "removeAllMessages",
    ]);
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
