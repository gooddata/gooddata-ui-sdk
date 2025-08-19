// (C) 2022-2025 GoodData Corporation
import React, { useCallback, useContext, useMemo } from "react";

import { Messages, ToastMessageContext } from "@gooddata/sdk-ui-kit";

import { useDrillValidationMessages } from "./useDrillValidationMessages.js";
import { useFilterContextValidationMessages } from "./useFilterContextValidationMessages.js";

/**
 * @internal
 */
export const ToastMessages: React.FC = () => {
    const { messages: toastMessages, removeMessage: removeToastMessage } = useContext(ToastMessageContext);
    const { messages: drillValidationMessages, removeMessage: removeDrillValidationMessage } =
        useDrillValidationMessages();
    const { messages: filterContextValidationMessages, removeMessage: removeFilterContextValidationMessage } =
        useFilterContextValidationMessages();

    const messages = useMemo(
        () => [...toastMessages, ...drillValidationMessages, ...filterContextValidationMessages],
        [toastMessages, drillValidationMessages, filterContextValidationMessages],
    );

    const removeMessage = useCallback(
        // try removing the id from both collections
        (id: string) => {
            removeToastMessage(id);
            removeDrillValidationMessage(id);
            removeFilterContextValidationMessage(id);
        },
        [removeDrillValidationMessage, removeFilterContextValidationMessage, removeToastMessage],
    );

    return <Messages messages={messages} onMessageClose={removeMessage} />;
};
