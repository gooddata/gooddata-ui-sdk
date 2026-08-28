// (C) 2026 GoodData Corporation

import { useAutomationsContext } from "../../contexts/AutomationsContext.js";
import { useScheduledEmailDialogContext } from "../../contexts/ScheduledEmailDialogContext.js";

import { useScheduledExportData } from "./ScheduledExportDataContext.js";
import { useScheduledExportDraft } from "./ScheduledExportDraftContext.js";
import { type IScheduledExportDialogValidity } from "./types.js";
import { useScheduledEmailFormValidity } from "./useScheduledEmailFormValidity.js";

/**
 * Reads the scheduled-export dialog's validity: whether submit is enabled, the validation message to
 * show, whether the schedule's source widget still exists, and which recipient kinds the selected
 * notification channel permits.
 *
 * Derived per consumer rather than published on a context: it is a pure function of the draft, the
 * recipient defaults and the dialog's own context, and no consumer observes its identity.
 *
 * @alpha
 */
export function useScheduledExportDialogValidity(): IScheduledExportDialogValidity {
    const { maxAutomationsRecipients } = useAutomationsContext();
    const { scheduledExportToEdit, notificationChannels } = useScheduledEmailDialogContext();
    const {
        editedAutomation,
        originalAutomation,
        isCronValid,
        isTitleValid,
        isSubjectValid,
        isOnMessageValid,
    } = useScheduledExportDraft();
    const { defaultRecipient } = useScheduledExportData();

    return useScheduledEmailFormValidity({
        editedAutomation,
        originalAutomation,
        scheduledExportToEdit,
        notificationChannels,
        defaultRecipient,
        maxAutomationsRecipients,
        isCronValid,
        isTitleValid,
        isSubjectValid,
        isOnMessageValid,
    });
}
