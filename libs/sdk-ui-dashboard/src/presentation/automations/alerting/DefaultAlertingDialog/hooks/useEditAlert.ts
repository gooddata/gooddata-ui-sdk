// (C) 2019-2026 GoodData Corporation

import { useState } from "react";

import {
    type FilterContextItem,
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type IAutomationVisibleFilter,
    type IInsight,
    type IInsightWidget,
    type INotificationChannelIdentifier,
    type INotificationChannelMetadataObject,
    type IWidget,
    type IWorkspaceUser,
} from "@gooddata/sdk-model";

import { useAlertingDialogContext } from "../../../contexts/AlertingDialogContext.js";
import { useAutomationsContext } from "../../../contexts/AutomationsContext.js";
import { setAlertExecutionParameters } from "../../../shared/automationFilters/automationParameters.js";
import { useAutomationAlertParameters } from "../../../shared/automationFilters/useAutomationAlertParameters.js";
import {
    getAppliedWidgetFilters,
    getVisibleFiltersByFilters,
    resolveMvfDimensionalityLocalRefs,
} from "../../../shared/automationFilters/utils.js";
import {
    convertCurrentUserToAutomationRecipient,
    convertCurrentUserToWorkspaceUser,
    convertExternalRecipientToAutomationRecipient,
} from "../../../shared/utils/automationUtils.js";
import { createDefaultAlert } from "../utils/convertors.js";

import { useAlertFilters } from "./useAlertFilters.js";
import { useAlertFormState } from "./useAlertFormState.js";
import { useAlertFormValidation } from "./useAlertFormValidation.js";
import { useAlertSelectedValues } from "./useAlertSelectedValues.js";
import { useAlertSupportedMetrics } from "./useAlertSupportedMetrics.js";
import { useAlertThreshold } from "./useAlertThreshold.js";

export interface IUseEditAlertProps {
    alertToEdit?: IAutomationMetadataObject;
    notificationChannels: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];
    maxAutomationsRecipients: number;
    users: IWorkspaceUser[];
    widget?: IWidget;
    insight?: IInsight;
    editedAutomationFilters?: FilterContextItem[];

    setEditedAutomationFilters: (filters: FilterContextItem[]) => void;
    availableFiltersAsVisibleFilters?: IAutomationVisibleFilter[] | undefined;
    filtersForNewAutomation: FilterContextItem[];
    externalRecipientOverride?: string;
}

export function useEditAlert({
    alertToEdit,
    notificationChannels,
    insight,
    widget,
    users,
    editedAutomationFilters,
    maxAutomationsRecipients,
    setEditedAutomationFilters,
    availableFiltersAsVisibleFilters,
    filtersForNewAutomation,
    externalRecipientOverride,
}: IUseEditAlertProps) {
    const {
        catalogDateDatasets,
        catalogAttributes,
        currentUser,
        separators,
        weekStart,
        timezone,
        settings,
        allowHourlyRecurrence,
        features: { enableAlertOncePerInterval },
    } = useAutomationsContext();

    const isInvalidConnectionToInsight = alertToEdit?.metadata?.widget && !insight;

    const {
        dashboardId,
        hiddenFilters: dashboardHiddenFilters,
        commonDateFilterId,
        dashboardEvaluationFrequency,
        widgetLocalIdToTabIdMap: widgetTabMap,
        parameterValues,
    } = useAlertingDialogContext();

    // Determine target tab ID if widget is present
    const targetTabIdentifier = widget?.localIdentifier ? widgetTabMap[widget.localIdentifier] : undefined;

    const {
        measureFormatMap,
        supportedMeasures,
        supportedAttributes,
        isResultLoading,
        getAttributeValues,
        getMetricValue,
    } = useAlertSupportedMetrics({ insight, widget, alertToEdit });

    // Default values
    const defaultMeasure = supportedMeasures[0];
    const defaultUser = convertCurrentUserToWorkspaceUser(users ?? [], currentUser);
    const defaultRecipient = externalRecipientOverride
        ? convertExternalRecipientToAutomationRecipient(externalRecipientOverride)
        : convertCurrentUserToAutomationRecipient(users ?? [], currentUser);
    const defaultNotificationChannelId = notificationChannels[0]?.id;

    const resolvedAlertToEdit = (() => {
        if (!alertToEdit) {
            return undefined;
        }
        const filters = alertToEdit.alert?.execution?.filters;
        if (!alertToEdit.alert || !filters?.length || !insight) {
            return alertToEdit;
        }
        const resolvedFilters = resolveMvfDimensionalityLocalRefs(filters, insight);
        if (resolvedFilters === filters) {
            return alertToEdit;
        }
        return {
            ...alertToEdit,
            alert: {
                ...alertToEdit.alert,
                execution: {
                    ...alertToEdit.alert.execution,
                    filters: resolvedFilters,
                },
            },
        };
    })();

    const [editedAutomation, setEditedAutomation] = useState<IAutomationMetadataObjectDefinition | undefined>(
        () => {
            if (resolvedAlertToEdit) {
                return resolvedAlertToEdit;
            }
            const defaultNewAlert = createDefaultAlert(
                getAppliedWidgetFilters(
                    editedAutomationFilters ?? [],
                    dashboardHiddenFilters,
                    widget,
                    insight,
                    commonDateFilterId,
                    true,
                    false,
                ),
                supportedMeasures,
                defaultMeasure,
                defaultNotificationChannelId,
                defaultRecipient,
                measureFormatMap,
                undefined,
                dashboardEvaluationFrequency
                    ? {
                          cron: dashboardEvaluationFrequency,
                          timezone: settings?.alertDefault?.defaultTimezone,
                      }
                    : undefined,
                getVisibleFiltersByFilters(editedAutomationFilters, availableFiltersAsVisibleFilters, true),
                widget?.localIdentifier,
                dashboardId,
                (widget as IInsightWidget)?.title,
                targetTabIdentifier,
            );
            return defaultNewAlert && parameterValues.length > 0
                ? setAlertExecutionParameters(defaultNewAlert, parameterValues)
                : defaultNewAlert;
        },
    );

    const [originalAutomation] = useState(editedAutomation);

    const {
        automationParameters,
        availableParameters,
        onParameterChange,
        onParameterDelete,
        onParameterAdd,
        dropStaleParameters,
    } = useAutomationAlertParameters({ editedAutomation, setEditedAutomation, widgetRef: widget?.ref });

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

    //
    // Handlers
    //
    const {
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
        setEditedAutomation,
        supportedMeasures,
        supportedAttributes,
        measureFormatMap,
        weekStart,
        timezone,
        enableAlertOncePerInterval,
        notificationChannels,
        currentUser,
        users,
        alertToEdit,
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
        allowOnlyLoggedUserRecipients,
        allowExternalRecipients,
        validationErrorMessage,
        isSubmitDisabled,
        isParentValid,
        thresholdErrorMessage,
        allowHourlyRecurrence,
    };
}
