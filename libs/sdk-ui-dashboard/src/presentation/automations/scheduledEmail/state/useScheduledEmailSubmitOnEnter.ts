// (C) 2026 GoodData Corporation

import { type KeyboardEvent, useCallback } from "react";

import { isEnterKey } from "@gooddata/sdk-ui-kit";

import { useAutomationsContext } from "../../contexts/AutomationsContext.js";

import { useScheduledExportDialogValidity } from "./useScheduledExportDialogValidity.js";

/**
 * Inputs of {@link useScheduledEmailSubmitOnEnter} — the dialog's single save, from one
 * {@link useSaveScheduledEmailToBackend} instance.
 *
 * @alpha
 */
export interface IUseScheduledEmailSubmitOnEnterInput {
    /**
     * `handleSaveScheduledEmail` of the dialog's {@link useSaveScheduledEmailToBackend} instance.
     */
    onSubmit: () => void;

    /**
     * `isSavingScheduledEmail` of the same instance; Enter does nothing while a save is in flight.
     */
    isSaving: boolean;
}

/**
 * The Enter-to-submit key handler the default scheduled-export dialog attaches to its title, recipients
 * and recurrence inputs: calls `onSubmit` on Enter unless the submit button would be disabled — the same
 * guard {@link useScheduledEmailDialogActionBarProps} puts on the button (form validity, a save in
 * flight, execution-timestamp mode). Pass the result as `onTitleKeyDown` / `onKeyDownSubmit` to the
 * header and recipients blocks so every Enter path shares the dialog's one save.
 *
 * Throws outside the scheduled-export dialog's state providers.
 *
 * @alpha
 */
export function useScheduledEmailSubmitOnEnter({
    onSubmit,
    isSaving,
}: IUseScheduledEmailSubmitOnEnterInput): (event: KeyboardEvent) => void {
    const { isExecutionTimestampMode } = useAutomationsContext();
    const { isSubmitDisabled } = useScheduledExportDialogValidity();
    const disabled = isSubmitDisabled || isSaving || isExecutionTimestampMode;

    return useCallback(
        (event: KeyboardEvent) => {
            if (isEnterKey(event) && !disabled) {
                onSubmit();
            }
        },
        [disabled, onSubmit],
    );
}
