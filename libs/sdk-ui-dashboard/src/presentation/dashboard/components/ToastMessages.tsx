// (C) 2022-2025 GoodData Corporation
import React, { useCallback, useMemo } from "react";

import { NonContextToastsInterop } from "@gooddata/sdk-ui-kit";

import { useDrillValidationMessages } from "./useDrillValidationMessages.js";
import { useFilterContextValidationMessages } from "./useFilterContextValidationMessages.js";

/**
 * @internal
 */
export function ToastMessages() {
    const { messages: drillValidationMessages, removeMessage: removeDrillValidationMessage } =
        useDrillValidationMessages();
    const { messages: filterContextValidationMessages, removeMessage: removeFilterContextValidationMessage } =
        useFilterContextValidationMessages();

    const messages = useMemo(
        () => [...drillValidationMessages, ...filterContextValidationMessages],
        [drillValidationMessages, filterContextValidationMessages],
    );

    const removeMessage = useCallback(
        // try removing the id from both collections
        (id: string) => {
            removeDrillValidationMessage(id);
            removeFilterContextValidationMessage(id);
        },
        [removeDrillValidationMessage, removeFilterContextValidationMessage],
    );

    return <NonContextToastsInterop messages={messages} onDismissMessage={removeMessage} />;
}
