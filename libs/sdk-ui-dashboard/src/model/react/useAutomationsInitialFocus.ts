// (C) 2025 GoodData Corporation

import { useCallback, useRef } from "react";

import { IAutomationMetadataObject } from "@gooddata/sdk-model";

/**
 * Manages inital focus in dialogs using the Automations component.
 *
 * @alpha
 */
export const useAutomationsInitialFocus = () => {
    const addButtonRef = useRef<HTMLButtonElement | null>(null);

    const onAutomationsLoad = useCallback(
        (items: Array<IAutomationMetadataObject>, isInitialState: boolean) => {
            if (isInitialState && items.length === 0) {
                addButtonRef.current?.focus();
            }
        },
        [],
    );

    return {
        addButtonRef,
        onAutomationsLoad,
    };
};
