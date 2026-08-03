// (C) 2019-2026 GoodData Corporation

import { type FilterContextItem, type IAutomationVisibleFilter } from "@gooddata/sdk-model";

import { useAlertingDialogContext } from "../../../contexts/AlertingDialogContext.js";
import { useAutomationsContext } from "../../../contexts/AutomationsContext.js";

import { useAlertFilters } from "./useAlertFilters.js";
import { useAlertFormState } from "./useAlertFormState.js";
import { useAlertFormValidation } from "./useAlertFormValidation.js";
import { useAlertSelectedValues } from "./useAlertSelectedValues.js";
import { useAlertSupportedMetrics } from "./useAlertSupportedMetrics.js";
import { useAlertThreshold } from "./useAlertThreshold.js";

export interface IUseEditAlertProps {
    maxAutomationsRecipients: number;
    editedAutomationFilters?: FilterContextItem[];

    setEditedAutomationFilters: (filters: FilterContextItem[]) => void;
    availableFiltersAsVisibleFilters?: IAutomationVisibleFilter[] | undefined;
    filtersForNewAutomation: FilterContextItem[];
    externalRecipientOverride?: string;
}

export function useEditAlert({
    editedAutomationFilters,
    maxAutomationsRecipients,
    setEditedAutomationFilters,
    availableFiltersAsVisibleFilters,
    filtersForNewAutomation,
    externalRecipientOverride,
}: IUseEditAlertProps) {
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

    const { onFiltersChange, onApplyCurrentFilters } = useAlertFilters({
        setEditedAutomation,
        setEditedAutomationFilters,
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
        onFiltersChange,
        onApplyCurrentFilters,
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
