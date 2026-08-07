// (C) 2019-2026 GoodData Corporation

import { useAutomationsContext } from "../../../contexts/AutomationsContext.js";
import { useScheduledEmailDialogContext } from "../../../contexts/ScheduledEmailDialogContext.js";
import { useAutomationFiltersSelect } from "../../../shared/automationFilters/useAutomationFiltersSelect.js";
import { type PdfPageSize } from "../../utils/pdfPageSize.js";

import { useScheduledEmailEffectiveFilters } from "./useScheduledEmailEffectiveFilters.js";
import { useScheduledEmailExportSettings } from "./useScheduledEmailExportSettings.js";
import { useScheduledEmailFilters } from "./useScheduledEmailFilters.js";
import { useScheduledEmailFormState } from "./useScheduledEmailFormState.js";
import { useScheduledEmailFormValidity } from "./useScheduledEmailFormValidity.js";

export interface IUseEditScheduledEmailProps {
    maxAutomationsRecipients: number;
    externalRecipientOverride?: string;
    /**
     * Locale-derived default page size for new PDF attachments. Required and non-nullable: it
     * reaches the saved export definition through {@link useScheduledEmailExportSettings}, so a caller
     * that omits it silently saves `A4` where the locale asks for `LETTER`.
     */
    defaultPdfPageSize: PdfPageSize;
}

export function useEditScheduledEmail({
    maxAutomationsRecipients,
    externalRecipientOverride,
    defaultPdfPageSize,
}: IUseEditScheduledEmailProps) {
    const {
        features: { enableAutomationEvaluationMode },
    } = useAutomationsContext();

    const {
        scheduledExportToEdit,
        widget,
        insight,
        users,
        usersError,
        notificationChannels,
        dashboardFilters,
    } = useScheduledEmailDialogContext();

    const areDashboardFiltersChanged = !!dashboardFilters;

    const {
        editedAutomationFilters,
        setEditedAutomationFilters,
        availableFilters,
        availableFiltersAsVisibleFilters,
        filtersForNewAutomation,
        storeFilters,
        setStoreFilters,
        filtersByTab,
        editedAutomationFiltersByTab,
        setEditedAutomationFiltersByTab,
        availableFiltersAsVisibleFiltersByTab,
    } = useAutomationFiltersSelect({ automationToEdit: scheduledExportToEdit, widget });

    const {
        effectiveWidgetFilters,
        effectiveWidgetFiltersWithInsight,
        effectiveVisibleWidgetFilters,
        effectiveDashboardFilters,
        effectiveDashboardFiltersByTab,
        effectiveVisibleDashboardFilters,
        effectiveVisibleDashboardFiltersByTab,
        parametersByTabForNewAutomation,
    } = useScheduledEmailEffectiveFilters({
        widget,
        insight,
        editedAutomationFilters,
        editedAutomationFiltersByTab,
        availableFiltersAsVisibleFilters,
        availableFiltersAsVisibleFiltersByTab,
        filtersDataByTab: filtersByTab,
        storeFilters,
    });

    const {
        editedAutomation,
        setEditedAutomation,
        originalAutomation,
        defaultRecipient,
        defaultUser,
        onTitleChange,
        onRecurrenceChange,
        onEvaluationModeChange,
        onDestinationChange,
        onRecipientsChange,
        onSubjectChange,
        onMessageChange,
        isCronValid,
        isTitleValid,
        isSubjectValid,
        isOnMessageValid,
        startDate,
    } = useScheduledEmailFormState({
        scheduledExportToEdit,
        widget,
        insight,
        notificationChannels,
        users,
        externalRecipientOverride,
        effectiveWidgetFilters,
        effectiveWidgetFiltersWithInsight,
        effectiveVisibleWidgetFilters,
        effectiveDashboardFilters,
        effectiveDashboardFiltersByTab,
        effectiveVisibleDashboardFilters,
        effectiveVisibleDashboardFiltersByTab,
        parametersByTabForNewAutomation,
        defaultPdfPageSize,
    });

    const {
        selectedAttachments,
        isDashboardExportSelected,
        isCsvExportSelected,
        isXlsxExportSelected,
        xlsxSettings,
        pdfSettings,
        csvSettings,
        csvRawSettings,
        slidesTemplateIds,
        onDashboardAttachmentsChange,
        onWidgetAttachmentsChange,
        onXlsxSettingsChange,
        onPdfSettingsChange,
        onCsvSettingsChange,
        onCsvRawSettingsChange,
        onSlidesTemplateIdChange,
        setParametersWire,
    } = useScheduledEmailExportSettings({
        editedAutomation,
        setEditedAutomation,
        insight,
        widget,
        storeFilters,
        effectiveDashboardFilters,
        effectiveDashboardFiltersByTab,
        effectiveWidgetFilters,
        effectiveWidgetFiltersWithInsight,
        defaultPdfPageSize,
    });

    // Kept whole rather than destructured: every member is re-exposed unchanged, so spreading it into
    // the return means a member can never be dropped by forgetting to re-list it. What the model may
    // contain is gated by its own shape test, not here.
    const filterModel = useScheduledEmailFilters({
        setEditedAutomation,
        scheduledExportToEdit,
        widget,
        insight,
        editedAutomationFilters,
        setEditedAutomationFilters,
        editedAutomationFiltersByTab,
        setEditedAutomationFiltersByTab,
        availableFilters,
        availableFiltersAsVisibleFilters,
        availableFiltersAsVisibleFiltersByTab,
        filtersByTab,
        storeFilters,
        setStoreFilters,
        filtersForNewAutomation,
        setParametersWire,
    });

    const {
        isSubmitDisabled,
        validationErrorMessage,
        isParentValid,
        allowExternalRecipients,
        allowOnlyLoggedUserRecipients,
    } = useScheduledEmailFormValidity({
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

    return {
        defaultUser,
        areDashboardFiltersChanged,
        originalAutomation,
        editedAutomation,
        isCronValid,
        notificationChannels,
        users,
        usersError,
        isDashboardExportSelected,
        isCsvExportSelected,
        isXlsxExportSelected,
        xlsxSettings,
        pdfSettings,
        csvSettings,
        csvRawSettings,
        startDate,
        allowOnlyLoggedUserRecipients,
        allowExternalRecipients,
        validationErrorMessage,
        isSubmitDisabled,
        selectedAttachments,
        isParentValid,
        onTitleChange,
        onRecurrenceChange,
        onEvaluationModeChange,
        onDestinationChange,
        onRecipientsChange,
        onSubjectChange,
        onMessageChange,
        onDashboardAttachmentsChange,
        onWidgetAttachmentsChange,
        onXlsxSettingsChange,
        onPdfSettingsChange,
        onCsvSettingsChange,
        onCsvRawSettingsChange,
        slidesTemplateIds,
        onSlidesTemplateIdChange,
        setParametersWire,
        enableAutomationEvaluationMode,
        // Filter and export-parameter model, absorbed from `useScheduledEmailFilters` (which itself
        // absorbs `useAutomationExportParameters` and `useValidateExistingAutomationFilters`) — the
        // renderer calls none of those three hooks itself, it takes their output from here. Spread
        // last: its `availableFilters`, `storeFilters` and `filtersByTab` are the model's, not the
        // raw selection hook's.
        ...filterModel,
    };
}
