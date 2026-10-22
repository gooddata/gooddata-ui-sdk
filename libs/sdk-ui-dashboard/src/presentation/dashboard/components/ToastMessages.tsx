// (C) 2022-2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { NonContextToastsInterop } from "@gooddata/sdk-ui-kit";

import { useParameterToastMessages } from "../../filterBar/parameterFilter/useParameterToastMessages.js";

import { useCrossFilteringMessages } from "./useCrossFilteringMessages.js";
import { useDrillValidationMessages } from "./useDrillValidationMessages.js";
import { useEditModeLayoutNoteMessages } from "./useEditModeLayoutNoteMessages.js";
import { useFilterContextValidationMessages } from "./useFilterContextValidationMessages.js";

/**
 * @internal
 */
export function ToastMessages() {
    const { messages: drillValidationMessages, removeMessage: removeDrillValidationMessage } =
        useDrillValidationMessages();
    const { messages: filterContextValidationMessages, removeMessage: removeFilterContextValidationMessage } =
        useFilterContextValidationMessages();
    const { messages: editModeLayoutNoteMessages, removeMessage: removeEditModeLayoutNoteMessage } =
        useEditModeLayoutNoteMessages();

    useCrossFilteringMessages();
    useParameterToastMessages();

    const messages = useMemo(
        () => [...drillValidationMessages, ...filterContextValidationMessages, ...editModeLayoutNoteMessages],
        [drillValidationMessages, filterContextValidationMessages, editModeLayoutNoteMessages],
    );

    const removeMessage = useCallback(
        // try removing the id from all collections
        (id: string) => {
            removeDrillValidationMessage(id);
            removeFilterContextValidationMessage(id);
            removeEditModeLayoutNoteMessage(id);
        },
        [removeDrillValidationMessage, removeFilterContextValidationMessage, removeEditModeLayoutNoteMessage],
    );

    return <NonContextToastsInterop messages={messages} onDismissMessage={removeMessage} />;
}
