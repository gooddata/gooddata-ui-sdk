// (C) 2026 GoodData Corporation

import { type ReactNode, useMemo } from "react";

import { useAutomationsContext } from "../../contexts/AutomationsContext.js";
import { useScheduledEmailDialogContext } from "../../contexts/ScheduledEmailDialogContext.js";
import { useAutomationFiltersSelect } from "../../shared/automationFilters/useAutomationFiltersSelect.js";
import { getDefaultPdfPageSize } from "../utils/pdfPageSize.js";

import {
    type IScheduledExportActionsContextValue,
    ScheduledExportActionsContextProvider,
} from "./ScheduledExportActionsContext.js";
import {
    type IScheduledExportDataContextValue,
    ScheduledExportDataContextProvider,
} from "./ScheduledExportDataContext.js";
import {
    type IScheduledExportDraftContextValue,
    ScheduledExportDraftContextProvider,
} from "./ScheduledExportDraftContext.js";
import { ScheduledExportFiltersContextProvider } from "./ScheduledExportFiltersContext.js";
import { useScheduledEmailEffectiveFilters } from "./useScheduledEmailEffectiveFilters.js";
import { useScheduledEmailExportSettings } from "./useScheduledEmailExportSettings.js";
import { useScheduledEmailFiltersModel } from "./useScheduledEmailFiltersModel.js";
import { useScheduledEmailFormState } from "./useScheduledEmailFormState.js";

/**
 * Publishes the scheduled-export create/edit dialog's state as the four scheduled-export state
 * contexts once the dialog's data has loaded.
 *
 * Mounts above the resolved `ScheduledEmailDialogComponent`, so the default dialog, a shell of
 * blocks and a wholesale replacement all read the same state with no extra wiring. Defers mounting
 * the state model itself until `useScheduledEmailDialogContext().isLoading` is false, because the
 * state model seeds its draft from the dialog's loaded data in `useState` initializers that never
 * re-run — mounting earlier would freeze that seed against not-yet-loaded data. That is the
 * ordinary path here, not an edge case: a widget export's filters load after the dialog opens.
 *
 * Runs `useIntl`-calling hooks, so an `IntlProvider` must sit above it. Inside a `Dashboard` the
 * ambient wrapper in `DashboardInner` supplies one with the same locale; a mount site without one
 * throws in react-intl.
 *
 * @internal
 */
export function ScheduledEmailDialogStateProvider({ children }: { children: ReactNode }) {
    const { isLoading } = useScheduledEmailDialogContext();

    return isLoading ? (
        <>{children}</>
    ) : (
        <LoadedScheduledEmailDialogState>{children}</LoadedScheduledEmailDialogState>
    );
}

function LoadedScheduledEmailDialogState({ children }: { children: ReactNode }) {
    const { settings, externalRecipient } = useAutomationsContext();
    const { scheduledExportToEdit, widget, insight, notificationChannels } = useScheduledEmailDialogContext();

    const defaultPdfPageSize = getDefaultPdfPageSize(settings?.formatLocale);

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

    const formState = useScheduledEmailFormState({
        scheduledExportToEdit,
        widget,
        insight,
        notificationChannels,
        externalRecipientOverride: externalRecipient,
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

    const exportSettings = useScheduledEmailExportSettings({
        editedAutomation: formState.editedAutomation,
        setEditedAutomation: formState.setEditedAutomation,
        insight,
        widget,
        storeFilters,
        effectiveDashboardFilters,
        effectiveDashboardFiltersByTab,
        effectiveWidgetFilters,
        effectiveWidgetFiltersWithInsight,
        defaultPdfPageSize,
    });

    const filtersModel = useScheduledEmailFiltersModel({
        setEditedAutomation: formState.setEditedAutomation,
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
        setParametersWire: exportSettings.setParametersWire,
    });

    const draft = useMemo<IScheduledExportDraftContextValue>(
        () => ({
            editedAutomation: formState.editedAutomation,
            originalAutomation: formState.originalAutomation,
            startDate: formState.startDate,
            isCronValid: formState.isCronValid,
            isTitleValid: formState.isTitleValid,
            isSubjectValid: formState.isSubjectValid,
            isOnMessageValid: formState.isOnMessageValid,
        }),
        [
            formState.editedAutomation,
            formState.originalAutomation,
            formState.startDate,
            formState.isCronValid,
            formState.isTitleValid,
            formState.isSubjectValid,
            formState.isOnMessageValid,
        ],
    );

    const actions = useMemo<IScheduledExportActionsContextValue>(
        () => ({
            setEditedAutomation: formState.setEditedAutomation,
            onTitleChange: formState.onTitleChange,
            onRecurrenceChange: formState.onRecurrenceChange,
            onEvaluationModeChange: formState.onEvaluationModeChange,
            onDestinationChange: formState.onDestinationChange,
            onRecipientsChange: formState.onRecipientsChange,
            onSubjectChange: formState.onSubjectChange,
            onMessageChange: formState.onMessageChange,
            onDashboardAttachmentsChange: exportSettings.onDashboardAttachmentsChange,
            onWidgetAttachmentsChange: exportSettings.onWidgetAttachmentsChange,
            onXlsxSettingsChange: exportSettings.onXlsxSettingsChange,
            onPdfSettingsChange: exportSettings.onPdfSettingsChange,
            onCsvSettingsChange: exportSettings.onCsvSettingsChange,
            onCsvRawSettingsChange: exportSettings.onCsvRawSettingsChange,
            onSlidesTemplateIdChange: exportSettings.onSlidesTemplateIdChange,
        }),
        [
            formState.setEditedAutomation,
            formState.onTitleChange,
            formState.onRecurrenceChange,
            formState.onEvaluationModeChange,
            formState.onDestinationChange,
            formState.onRecipientsChange,
            formState.onSubjectChange,
            formState.onMessageChange,
            exportSettings.onDashboardAttachmentsChange,
            exportSettings.onWidgetAttachmentsChange,
            exportSettings.onXlsxSettingsChange,
            exportSettings.onPdfSettingsChange,
            exportSettings.onCsvSettingsChange,
            exportSettings.onCsvRawSettingsChange,
            exportSettings.onSlidesTemplateIdChange,
        ],
    );

    const data = useMemo<IScheduledExportDataContextValue>(
        () => ({ defaultUser: formState.defaultUser, defaultRecipient: formState.defaultRecipient }),
        [formState.defaultUser, formState.defaultRecipient],
    );

    return (
        <ScheduledExportDraftContextProvider value={draft}>
            <ScheduledExportActionsContextProvider value={actions}>
                <ScheduledExportDataContextProvider value={data}>
                    <ScheduledExportFiltersContextProvider value={filtersModel}>
                        {children}
                    </ScheduledExportFiltersContextProvider>
                </ScheduledExportDataContextProvider>
            </ScheduledExportActionsContextProvider>
        </ScheduledExportDraftContextProvider>
    );
}
