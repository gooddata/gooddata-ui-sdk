// (C) 2019-2026 GoodData Corporation

import {
    type FilterContextItem,
    type IAutomationMetadataObject,
    type IAutomationVisibleFilter,
    type IExportDefinitionVisualizationObjectSettings,
    type IFilter,
    type IInsight,
    type INotificationChannelIdentifier,
    type INotificationChannelMetadataObject,
    type IWidget,
    type IWorkspaceUser,
} from "@gooddata/sdk-model";

import type { IAutomationFiltersTab } from "../../../../../model/store/filtering/types.js";
import { useAutomationsContext } from "../../../contexts/AutomationsContext.js";

import { useScheduledEmailEffectiveFilters } from "./useScheduledEmailEffectiveFilters.js";
import { useScheduledEmailExportSettings } from "./useScheduledEmailExportSettings.js";
import { useScheduledEmailFilters } from "./useScheduledEmailFilters.js";
import { useScheduledEmailFormState } from "./useScheduledEmailFormState.js";
import { useScheduledEmailFormValidity } from "./useScheduledEmailFormValidity.js";

export interface IUseEditScheduledEmailProps {
    scheduledExportToEdit?: IAutomationMetadataObject;
    notificationChannels: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];
    maxAutomationsRecipients: number;
    /** Workspace users, lazy-loaded in the connector and passed via dialog props. */
    users: IWorkspaceUser[];
    widget?: IWidget;
    insight?: IInsight;
    widgetFilters?: IFilter[];
    editedAutomationFilters?: FilterContextItem[];
    dashboardFilters?: FilterContextItem[];
    setEditedAutomationFilters: (filters: FilterContextItem[]) => void;

    /**
     * Edited filters structured by tab ID for dashboard automations with tabs enabled.
     * When provided, these are used instead of dashboardFilters for per-tab filter storage.
     */
    editedAutomationFiltersByTab?: Record<string, FilterContextItem[]>;
    /**
     * Setter for editedFiltersByTab state.
     * Used to update filters for a specific tab.
     */
    setEditedAutomationFiltersByTab?: (filters: Record<string, FilterContextItem[]>) => void;
    filtersDataByTab?: IAutomationFiltersTab[] | undefined;
    availableFiltersAsVisibleFilters?: IAutomationVisibleFilter[] | undefined;
    availableFiltersAsVisibleFiltersByTab?: Record<string, IAutomationVisibleFilter[]>;
    // Option to opt out of storing filters
    storeFilters?: boolean;
    setStoreFilters: (storeFilters: boolean) => void;
    filtersForNewAutomation: FilterContextItem[];
    externalRecipientOverride?: string;
    defaultPdfPageSize?: IExportDefinitionVisualizationObjectSettings["pageSize"];
}

export function useEditScheduledEmail({
    scheduledExportToEdit,
    notificationChannels,
    insight,
    widget,
    users,
    editedAutomationFilters,
    dashboardFilters,
    editedAutomationFiltersByTab,
    maxAutomationsRecipients,
    setEditedAutomationFilters,
    setEditedAutomationFiltersByTab,
    availableFiltersAsVisibleFilters,
    storeFilters,
    setStoreFilters,
    filtersForNewAutomation,
    externalRecipientOverride,
    defaultPdfPageSize,
    filtersDataByTab,
    availableFiltersAsVisibleFiltersByTab,
}: IUseEditScheduledEmailProps) {
    const {
        features: { enableAutomationEvaluationMode },
    } = useAutomationsContext();

    const areDashboardFiltersChanged = !!dashboardFilters;

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
        filtersDataByTab,
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

    const { onFiltersChange, onFiltersByTabChange, onApplyCurrentFilters, onStoreFiltersChange } =
        useScheduledEmailFilters({
            setEditedAutomation,
            widget,
            insight,
            setEditedAutomationFilters,
            setEditedAutomationFiltersByTab,
            availableFiltersAsVisibleFilters,
            availableFiltersAsVisibleFiltersByTab,
            filtersDataByTab,
            storeFilters,
            setStoreFilters,
            filtersForNewAutomation,
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
        storeFilters,
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
        onFiltersChange,
        onApplyCurrentFilters,
        onStoreFiltersChange,
        onFiltersByTabChange,
        setParametersWire,
        enableAutomationEvaluationMode,
    };
}
