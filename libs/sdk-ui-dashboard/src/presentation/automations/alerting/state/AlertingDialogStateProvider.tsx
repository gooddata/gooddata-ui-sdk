// (C) 2026 GoodData Corporation

import { type ReactNode, useMemo } from "react";

import { useAlertingDialogContext } from "../../contexts/AlertingDialogContext.js";
import { useAutomationsContext } from "../../contexts/AutomationsContext.js";
import { useAutomationFiltersSelect } from "../../shared/automationFilters/useAutomationFiltersSelect.js";

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
import { useAlertFiltersModel } from "./useAlertFiltersModel.js";
import { useAlertFormState } from "./useAlertFormState.js";
import { getAlertSelectedValues } from "./useAlertSelectedValues.js";
import { useAlertSupportedMetrics } from "./useAlertSupportedMetrics.js";

/**
 * Publishes the alerting create/edit dialog's state as the four alert state contexts once the
 * dialog's data has loaded.
 *
 * Mounts above the resolved `AlertingDialogComponent`, so the default dialog, a shell of blocks
 * and a wholesale replacement all read the same state with no extra wiring. Defers mounting the
 * state model itself until `useAlertingDialogContext().isLoading` is false, because the state
 * model seeds its draft from the dialog's loaded data in `useState` initializers that never
 * re-run — mounting earlier would freeze that seed against not-yet-loaded data.
 *
 * Runs `useIntl`-calling hooks, so an `IntlProvider` must sit above it. Inside a `Dashboard` the
 * ambient wrapper in `DashboardInner` supplies one with the same locale; a mount site without one
 * throws in react-intl.
 *
 * @internal
 */
export function AlertingDialogStateProvider({ children }: { children: ReactNode }) {
    const { isLoading } = useAlertingDialogContext();

    return isLoading ? <>{children}</> : <LoadedAlertingDialogState>{children}</LoadedAlertingDialogState>;
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

    const filtersModel = useAlertFiltersModel({
        setEditedAutomation: formState.setEditedAutomation,
        alertToEdit,
        editedAutomationFilters,
        setEditedAutomationFilters,
        availableFilters,
        filtersForNewAutomation,
        availableFiltersAsVisibleFilters,
        dashboardHiddenFilters,
        commonDateFilterId,
        widget,
        insight,
        supportedMeasures,
        supportedAttributes,
        measureFormatMap,
        selectedMeasure,
        selectedAttribute,
        selectedValue,
        weekStart,
        timezone,
    });

    const draft = useMemo<IAlertDraftContextValue>(
        () => ({
            editedAutomation: formState.editedAutomation,
            originalAutomation: formState.originalAutomation,
            warningMessage: formState.warningMessage,
            isTitleValid: formState.isTitleValid,
        }),
        [
            formState.editedAutomation,
            formState.originalAutomation,
            formState.warningMessage,
            formState.isTitleValid,
        ],
    );

    const actions = useMemo<IAlertActionsContextValue>(
        () => ({
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
        }),
        [
            formState.setEditedAutomation,
            formState.onTitleChange,
            formState.onMeasureChange,
            formState.onAttributeChange,
            formState.onComparisonOperatorChange,
            formState.onRelativeOperatorChange,
            formState.onAnomalyDetectionChange,
            formState.onComparisonTypeChange,
            formState.onSensitivityChange,
            formState.onTriggerIntervalChange,
            formState.onGranularityChange,
            formState.onDestinationChange,
            formState.onTriggerModeChange,
            formState.onRecipientsChange,
        ],
    );

    const data = useMemo<IAlertDataContextValue>(
        () => ({
            supportedMeasures,
            supportedAttributes,
            measureFormatMap,
            isResultLoading,
            getAttributeValues,
            getMetricValue,
            defaultUser: formState.defaultUser,
            defaultRecipient: formState.defaultRecipient,
        }),
        [
            supportedMeasures,
            supportedAttributes,
            measureFormatMap,
            isResultLoading,
            getAttributeValues,
            getMetricValue,
            formState.defaultUser,
            formState.defaultRecipient,
        ],
    );

    const filters = useMemo<IAlertFiltersContextValue>(
        () => ({
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
        }),
        [
            filtersModel.selectedFilters,
            filtersModel.availableFilters,
            filtersModel.onFiltersChange,
            filtersModel.onApplyCurrentFilters,
            filtersModel.automationIsValid,
            filtersModel.filtersAreStale,
            formState.automationParameters,
            formState.availableParameters,
            formState.onParameterChange,
            formState.onParameterDelete,
            formState.onParameterAdd,
            formState.dropStaleParameters,
        ],
    );

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
