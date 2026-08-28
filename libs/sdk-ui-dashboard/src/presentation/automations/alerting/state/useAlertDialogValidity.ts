// (C) 2026 GoodData Corporation

import { useAlertingDialogContext } from "../../contexts/AlertingDialogContext.js";
import { useAutomationsContext } from "../../contexts/AutomationsContext.js";

import { useAlertData } from "./AlertDataContext.js";
import { useAlertDraft } from "./AlertDraftContext.js";
import { type IAlertDialogValidity } from "./types.js";
import { useAlertFormValidation } from "./useAlertFormValidation.js";
import { useAlertSelectedValues } from "./useAlertSelectedValues.js";

/**
 * Reads the alerting dialog's validity: whether submit is enabled, the validation message to show,
 * whether the parent widget is still valid, whether the measure may be changed, and whether the
 * saved alert points at a widget whose insight is gone.
 *
 * @alpha
 */
export function useAlertDialogValidity(): IAlertDialogValidity {
    const { catalogDateDatasets, maxAutomationsRecipients } = useAutomationsContext();
    const { alertToEdit, widget, insight } = useAlertingDialogContext();
    const { editedAutomation, originalAutomation, isTitleValid } = useAlertDraft();
    const { defaultRecipient } = useAlertData();
    const { selectedNotificationChannel, allowExternalRecipients, allowOnlyLoggedUserRecipients } =
        useAlertSelectedValues();

    const canChangeMeasure = !!insight;
    const isInvalidConnectionToInsight = !!alertToEdit?.metadata?.widget && !insight;

    const { isSubmitDisabled, validationErrorMessage, isParentValid } = useAlertFormValidation({
        editedAutomation,
        originalAutomation,
        alertToEdit,
        widget,
        insight,
        catalogDateDatasets,
        isInvalidConnectionToInsight,
        selectedNotificationChannel,
        allowExternalRecipients,
        allowOnlyLoggedUserRecipients,
        maxAutomationsRecipients,
        defaultRecipient,
        isTitleValid,
    });

    return {
        isSubmitDisabled,
        validationErrorMessage,
        isParentValid,
        canChangeMeasure,
        isInvalidConnectionToInsight,
    };
}
