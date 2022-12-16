// (C) 2022 GoodData Corporation
import React, { useCallback, useContext, useEffect, useMemo } from "react";
import { Messages, ToastMessageContext } from "@gooddata/sdk-ui-kit";
import { useDrillValidationMessages } from "./useDrillValidationMessages";
import { selectRenderMode, useDashboardSelector } from "../../../model";

/**
 * @internal
 */
export const ToastMessages: React.FC = () => {
    const {
        messages: toastMessages,
        removeMessage: removeToastMessage,
        removeAllMessages: removeAllToastMessages,
    } = useContext(ToastMessageContext);
    const {
        messages: drillValidationMessages,
        removeMessage: removeDrillValidationMessage,
        removeAllMessages: removeAllDrillValidationMessages,
    } = useDrillValidationMessages();

    const renderMode = useDashboardSelector(selectRenderMode);

    // remove all messages whenever the render mode changes
    useEffect(() => {
        removeAllToastMessages();
        removeAllDrillValidationMessages();
    }, [removeAllDrillValidationMessages, removeAllToastMessages, renderMode]);

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
