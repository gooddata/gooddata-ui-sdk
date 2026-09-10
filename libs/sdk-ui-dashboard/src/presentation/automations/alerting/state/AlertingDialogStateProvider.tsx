// (C) 2026 GoodData Corporation

import { type ReactNode, useState } from "react";

import { useAlertingDialogContext } from "../../contexts/AlertingDialogContext.js";
import { useAutomationsContext } from "../../contexts/AutomationsContext.js";
import { useAutomationFiltersSelect } from "../../shared/automationFilters/useAutomationFiltersSelect.js";
import { useShallowStable } from "../../shared/hooks/useShallowStable.js";

import { AlertActionsContextProvider } from "./AlertActionsContext.js";
import { AlertDataContextProvider } from "./AlertDataContext.js";
import { AlertDraftContextProvider } from "./AlertDraftContext.js";
import { AlertFiltersContextProvider } from "./AlertFiltersContext.js";
import {
    type IAlertActionsContextValue,
    type IAlertDataContextValue,
    type IAlertDraftContextValue,
    type IAlertFiltersContextValue,
} from "./types.js";
import { useAlertDraftFilterWrites } from "./useAlertDraftFilterWrites.js";
import { useAlertFiltersModel } from "./useAlertFiltersModel.js";
import { useAlertFormState } from "./useAlertFormState.js";
import { getAlertSelectedValues } from "./useAlertSelectedValues.js";
import { useAlertSupportedMetrics } from "./useAlertSupportedMetrics.js";

/**
 * Publishes the alerting create/edit dialog's state as the four alert state contexts from the
 * first render where the dialog's data has loaded.
 *
 * Mounts above the resolved `AlertingDialogComponent`, so the default dialog, a shell of blocks
 * and a wholesale replacement all read the same state with no extra wiring. Mounts the state
 * model on the first render where `useAlertingDialogContext().isLoading` is false and keeps it
 * mounted for the rest of the dialog's life: the model seeds its draft from the dialog's loaded
 * data in `useState` initializers that never re-run, so mounting earlier would freeze that seed
 * against not-yet-loaded data — and unmounting on a later `isLoading` flip (an automations
 * refresh) would discard the in-flight draft.
 *
 * Runs `useIntl`-calling hooks, so an `IntlProvider` must sit above it. Inside a `Dashboard` the
 * ambient wrapper in `DashboardInner` supplies one with the same locale; a mount site without one
 * throws in react-intl.
 *
 * @internal
 */
export function AlertingDialogStateProvider({ children }: { children: ReactNode }) {
    const { isLoading } = useAlertingDialogContext();

    // Latches on the first non-loading render: the draft seed must not run against unloaded
    // data, and once seeded it must survive isLoading flipping back (an automations refresh).
    const [hasLoaded, setHasLoaded] = useState(!isLoading);
    if (!isLoading && !hasLoaded) {
        setHasLoaded(true);
    }

    return hasLoaded ? <LoadedAlertingDialogState>{children}</LoadedAlertingDialogState> : <>{children}</>;
}

function LoadedAlertingDialogState({ children }: { children: ReactNode }) {
    const { weekStart, timezone, externalRecipient } = useAutomationsContext();
    const {
        hiddenFilters: dashboardHiddenFilters,
        commonDateFilterId,
        alertToEdit,
        notificationChannels,
        widget,
        insight,
    } = useAlertingDialogContext();

    const {
        editedAutomationFilters,
        setEditedAutomationFilters,
        availableFilters,
        availableFiltersAsVisibleFilters,
        filtersForNewAutomation,
    } = useAutomationFiltersSelect({ automationToEdit: alertToEdit, widget });

    const {
        measureFormatMap,
        supportedMeasures,
        supportedAttributes,
        isResultLoading,
        getAttributeValues,
        getMetricValue,
    } = useAlertSupportedMetrics({ insight, widget, alertToEdit });

    const formState = useAlertFormState({
        alertToEdit,
        insight,
        widget,
        notificationChannels,
        editedAutomationFilters,
        availableFiltersAsVisibleFilters,
        externalRecipientOverride: externalRecipient,
        supportedMeasures,
        supportedAttributes,
        measureFormatMap,
    });

    const { selectedMeasure, selectedAttribute, selectedValue } = getAlertSelectedValues({
        editedAutomation: formState.editedAutomation,
        supportedMeasures,
        supportedAttributes,
        notificationChannels,
    });

    const { applyFiltersToDraft } = useAlertDraftFilterWrites({
        setEditedAutomation: formState.setEditedAutomation,
        dashboardHiddenFilters,
        commonDateFilterId,
        widget,
        insight,
        availableFiltersAsVisibleFilters,
        supportedMeasures,
        supportedAttributes,
        measureFormatMap,
        selectedMeasure,
        selectedAttribute,
        selectedValue,
        weekStart,
        timezone,
    });

    const filtersModel = useAlertFiltersModel({
        alertToEdit,
        editedAutomationFilters,
        setEditedAutomationFilters,
        availableFilters,
        filtersForNewAutomation,
        widget,
        insight,
        applyFiltersToDraft,
    });

    const draft = useShallowStable<IAlertDraftContextValue>({
        editedAutomation: formState.editedAutomation,
        originalAutomation: formState.originalAutomation,
        warningMessage: formState.warningMessage,
        isTitleValid: formState.isTitleValid,
    });

    const actions = useShallowStable<IAlertActionsContextValue>({
        setEditedAutomation: formState.setEditedAutomation,
        onTitleChange: formState.onTitleChange,
        onMeasureChange: formState.onMeasureChange,
        onAttributeChange: formState.onAttributeChange,
        onComparisonOperatorChange: formState.onComparisonOperatorChange,
        onRelativeOperatorChange: formState.onRelativeOperatorChange,
        onAnomalyDetectionChange: formState.onAnomalyDetectionChange,
        onComparisonTypeChange: formState.onComparisonTypeChange,
        onSensitivityChange: formState.onSensitivityChange,
        onTriggerIntervalChange: formState.onTriggerIntervalChange,
        onGranularityChange: formState.onGranularityChange,
        onDestinationChange: formState.onDestinationChange,
        onTriggerModeChange: formState.onTriggerModeChange,
        onRecipientsChange: formState.onRecipientsChange,
    });

    const data = useShallowStable<IAlertDataContextValue>({
        supportedMeasures,
        supportedAttributes,
        measureFormatMap,
        isResultLoading,
        getAttributeValues,
        getMetricValue,
        defaultUser: formState.defaultUser,
        defaultRecipient: formState.defaultRecipient,
    });

    const filters = useShallowStable<IAlertFiltersContextValue>({
        selectedFilters: filtersModel.selectedFilters,
        availableFilters: filtersModel.availableFilters,
        onFiltersChange: filtersModel.onFiltersChange,
        onApplyCurrentFilters: filtersModel.onApplyCurrentFilters,
        automationIsValid: filtersModel.automationIsValid,
        filtersAreStale: filtersModel.filtersAreStale,
        automationParameters: formState.automationParameters,
        availableParameters: formState.availableParameters,
        onParameterChange: formState.onParameterChange,
        onParameterDelete: formState.onParameterDelete,
        onParameterAdd: formState.onParameterAdd,
        dropStaleParameters: formState.dropStaleParameters,
    });

    return (
        <AlertDraftContextProvider value={draft}>
            <AlertActionsContextProvider value={actions}>
                <AlertDataContextProvider value={data}>
                    <AlertFiltersContextProvider value={filters}>{children}</AlertFiltersContextProvider>
                </AlertDataContextProvider>
            </AlertActionsContextProvider>
        </AlertDraftContextProvider>
    );
}
