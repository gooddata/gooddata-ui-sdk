// (C) 2022 GoodData Corporation
import React, { useCallback, useContext, useMemo } from "react";
import { Messages, ToastMessageContext } from "@gooddata/sdk-ui-kit";
import { useDrillValidationMessages } from "./useDrillValidationMessages.js";

/**
 * @internal
 */
export const ToastMessages: React.FC = () => {
    const { messages: toastMessages, removeMessage: removeToastMessage } = useContext(ToastMessageContext);
    const { messages: drillValidationMessages, removeMessage: removeDrillValidationMessage } =
        useDrillValidationMessages();

    const messages = useMemo(
        () => [...toastMessages, ...drillValidationMessages],
        [toastMessages, drillValidationMessages],
    );

    const removeMessage = useCallback(
        // try removing the id from both collections
        (id: string) => {
            removeToastMessage(id);
            removeDrillValidationMessage(id);
        },
        [removeDrillValidationMessage, removeToastMessage],
    );

    if (messages.length > 0) {
        return <Messages messages={messages} onMessageClose={removeMessage} />;
    }
    return null;
};
