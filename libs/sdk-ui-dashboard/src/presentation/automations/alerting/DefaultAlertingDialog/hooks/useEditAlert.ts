// (C) 2019-2026 GoodData Corporation

import { useAlertingDialogContext } from "../../../contexts/AlertingDialogContext.js";
import { useAutomationsContext } from "../../../contexts/AutomationsContext.js";
import { useAutomationFiltersSelect } from "../../../shared/automationFilters/useAutomationFiltersSelect.js";

import { useAlertFilters } from "./useAlertFilters.js";
import { useAlertFormState } from "./useAlertFormState.js";
import { useAlertFormValidation } from "./useAlertFormValidation.js";
import { useAlertSelectedValues } from "./useAlertSelectedValues.js";
import { useAlertSupportedMetrics } from "./useAlertSupportedMetrics.js";
import { useAlertThreshold } from "./useAlertThreshold.js";

export interface IUseEditAlertProps {
    maxAutomationsRecipients: number;
    externalRecipientOverride?: string;
}

export function useEditAlert({ maxAutomationsRecipients, externalRecipientOverride }: IUseEditAlertProps) {
    const { catalogDateDatasets, catalogAttributes, separators, weekStart, timezone, allowHourlyRecurrence } =
        useAutomationsContext();

    const {
        hiddenFilters: dashboardHiddenFilters,
        commonDateFilterId,
        alertToEdit,
        users,
        usersError,
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

    const isInvalidConnectionToInsight = alertToEdit?.metadata?.widget && !insight;

    const {
        measureFormatMap,
        supportedMeasures,
        supportedAttributes,
        isResultLoading,
        getAttributeValues,
        getMetricValue,
    } = useAlertSupportedMetrics({ insight, widget, alertToEdit });

    const {
        editedAutomation,
        setEditedAutomation,
        originalAutomation,
        defaultUser,
        defaultRecipient,
        automationParameters,
        availableParameters,
        onParameterChange,
        onParameterDelete,
        onParameterAdd,
        dropStaleParameters,
        onTitleChange,
        onMeasureChange,
        onAttributeChange,
        onComparisonOperatorChange,
        onRelativeOperatorChange,
        onAnomalyDetectionChange,
        onComparisonTypeChange,
        onSensitivityChange,
        onTriggerIntervalChange,
        onGranularityChange,
        onDestinationChange,
        onTriggerModeChange,
        onRecipientsChange,
        warningMessage,
        isTitleValid,
    } = useAlertFormState({
        alertToEdit,
        insight,
        widget,
        notificationChannels,
        users,
        editedAutomationFilters,
        availableFiltersAsVisibleFilters,
        externalRecipientOverride,
        supportedMeasures,
        supportedAttributes,
        measureFormatMap,
    });

    //
    // Selected values
    //
    const {
        selectedMeasure,
        selectedComparisonOperator,
        selectedRelativeOperator,
        selectedAiOperator,
        selectedComparator,
        selectedSensitivity,
        selectedGranularity,
        selectedAttribute,
        selectedValue,
        selectedNotificationChannel,
        allowExternalRecipients,
        allowOnlyLoggedUserRecipients,
    } = useAlertSelectedValues({
        editedAutomation,
        supportedMeasures,
        supportedAttributes,
        notificationChannels,
    });

    // Kept whole rather than destructured: every member is re-exposed unchanged, so spreading it into
    // the return means a member can never be dropped by forgetting to re-list it. What the model may
    // contain is gated by its own shape test, not here.
    const filterModel = useAlertFilters({
        setEditedAutomation,
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

    const { value, onChange, onBlur, thresholdErrorMessage } = useAlertThreshold({
        setEditedAutomation,
        editedAutomation,
        getMetricValue,
        isNewAlert: !alertToEdit,
        selectedRelativeOperator,
        selectedMeasure,
        selectedAttribute,
        selectedValue,
    });

    const { isSubmitDisabled, validationErrorMessage, isParentValid } = useAlertFormValidation({
        editedAutomation,
        originalAutomation,
        alertToEdit,
        widget,
        insight,
        catalogDateDatasets,
        isInvalidConnectionToInsight: !!isInvalidConnectionToInsight,
        selectedNotificationChannel,
        allowExternalRecipients,
        allowOnlyLoggedUserRecipients,
        maxAutomationsRecipients,
        defaultRecipient,
        isTitleValid,
    });

    return {
        onTitleChange,
        onRecipientsChange,
        // Filter model, absorbed from `useAlertFilters`. Spread rather than re-listed so a member
        // cannot be dropped by omission; its `availableFilters` is the model's, not the raw
        // selection hook's.
        ...filterModel,
        automationParameters,
        availableParameters,
        onParameterChange,
        onParameterDelete,
        onParameterAdd,
        dropStaleParameters,
        onMeasureChange,
        getAttributeValues,
        onAttributeChange,
        onComparisonOperatorChange,
        onRelativeOperatorChange,
        onAnomalyDetectionChange,
        onSensitivityChange,
        onGranularityChange,
        onChange,
        onBlur,
        onComparisonTypeChange,
        onDestinationChange,
        onTriggerModeChange,
        onTriggerIntervalChange,
        selectedMeasure,
        canChangeMeasure: !!insight,
        supportedMeasures,
        selectedAttribute,
        selectedValue,
        supportedAttributes,
        catalogAttributes,
        catalogDateDatasets,
        isResultLoading,
        isInvalidConnectionToInsight,
        selectedAiOperator,
        selectedSensitivity,
        selectedGranularity,
        selectedComparisonOperator,
        selectedRelativeOperator,
        value,
        selectedComparator,
        separators,
        warningMessage,
        defaultUser,
        originalAutomation,
        editedAutomation,
        users,
        usersError,
        notificationChannels,
        allowOnlyLoggedUserRecipients,
        allowExternalRecipients,
        validationErrorMessage,
        isSubmitDisabled,
        isParentValid,
        thresholdErrorMessage,
        allowHourlyRecurrence,
    };
}
