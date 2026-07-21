// (C) 2019-2026 GoodData Corporation

import { useCallback, useState } from "react";

import { useIntl } from "react-intl";

import {
    type DateAttributeGranularity,
    type FilterContextItem,
    type IAlertAnomalyDetectionGranularity,
    type IAlertAnomalyDetectionSensitivity,
    type IAlertComparisonOperator,
    type IAlertRelativeArithmeticOperator,
    type IAlertRelativeOperator,
    type IAlertTriggerInterval,
    type IAlertTriggerMode,
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type IAutomationRecipient,
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
import { type AlertAttribute, type AlertMetric, type AlertMetricComparatorType } from "../../types.js";
import { createDefaultAlert } from "../utils/convertors.js";
import {
    transformAlertByAnomalyDetection,
    transformAlertByAttribute,
    transformAlertByComparisonOperator,
    transformAlertByDestination,
    transformAlertByGranularity,
    transformAlertByMetric,
    transformAlertByRelativeOperator,
    transformAlertBySensitivity,
} from "../utils/transformation.js";

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
    const intl = useIntl();

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

    // Local state
    const [warningMessage, setWarningMessage] = useState<string | undefined>(undefined);
    const [isTitleValid, setIsTitleValid] = useState(true);
    const [triggerIntervalDirty, setTriggerIntervalDirty] = useState(false);

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
    const onTitleChange = (value: string, isValid: boolean) => {
        setIsTitleValid(isValid);
        setEditedAutomation((s) => (s ? { ...s, title: value } : undefined));
    };

    const onMeasureChange = useCallback(
        (measure: AlertMetric) => {
            setEditedAutomation((alert) =>
                alert
                    ? transformAlertByMetric(
                          supportedMeasures,
                          alert as IAutomationMetadataObject,
                          measure,
                          measureFormatMap,
                          weekStart,
                          timezone,
                      )
                    : undefined,
            );
        },
        [measureFormatMap, supportedMeasures, weekStart, timezone],
    );
    const onAttributeChange = useCallback(
        (
            attribute: AlertAttribute | undefined,
            value:
                | {
                      title: string;
                      value: string;
                      name: string;
                  }
                | undefined,
        ) => {
            setEditedAutomation((alert) =>
                alert
                    ? transformAlertByAttribute(
                          supportedAttributes,
                          alert as IAutomationMetadataObject,
                          attribute,
                          value,
                      )
                    : undefined,
            );
        },
        [supportedAttributes],
    );

    const onComparisonOperatorChange = useCallback(
        (measure: AlertMetric, comparisonOperator: IAlertComparisonOperator) => {
            setEditedAutomation((alert) =>
                alert
                    ? transformAlertByComparisonOperator(
                          supportedMeasures,
                          alert as IAutomationMetadataObject,
                          measure,
                          comparisonOperator,
                      )
                    : undefined,
            );
        },
        [supportedMeasures],
    );

    const onRelativeOperatorChange = useCallback(
        (
            measure: AlertMetric,
            relativeOperator: IAlertRelativeOperator,
            arithmeticOperator: IAlertRelativeArithmeticOperator,
        ) => {
            setEditedAutomation((alert) =>
                alert
                    ? transformAlertByRelativeOperator(
                          supportedMeasures,
                          alert as IAutomationMetadataObject,
                          measure,
                          relativeOperator,
                          arithmeticOperator,
                          measureFormatMap,
                      )
                    : undefined,
            );
        },
        [measureFormatMap, supportedMeasures],
    );

    const onAnomalyDetectionChange = useCallback(
        (measure: AlertMetric) => {
            setTriggerIntervalDirty(false);
            setEditedAutomation((alert) =>
                transformAlertByAnomalyDetection(
                    supportedMeasures,
                    alert as IAutomationMetadataObject,
                    measure,
                    weekStart,
                    timezone,
                    enableAlertOncePerInterval,
                ),
            );
        },
        [supportedMeasures, weekStart, timezone, enableAlertOncePerInterval],
    );

    const onComparisonTypeChange = useCallback(
        (
            measure: AlertMetric | undefined,
            relativeOperator: [IAlertRelativeOperator, IAlertRelativeArithmeticOperator] | undefined,
            comparisonType: AlertMetricComparatorType,
            granularity?: DateAttributeGranularity,
        ) => {
            if (!measure || !relativeOperator || !relativeOperator) {
                return;
            }
            const [relativeOperatorValue, arithmeticOperator] = relativeOperator;
            setEditedAutomation((alert) =>
                alert
                    ? transformAlertByRelativeOperator(
                          supportedMeasures,
                          alert as IAutomationMetadataObject,
                          measure,
                          relativeOperatorValue,
                          arithmeticOperator,
                          measureFormatMap,
                          comparisonType,
                          granularity,
                      )
                    : undefined,
            );
        },
        [measureFormatMap, supportedMeasures],
    );

    const onSensitivityChange = useCallback((sensitivity: IAlertAnomalyDetectionSensitivity) => {
        setEditedAutomation((alert) =>
            transformAlertBySensitivity(alert as IAutomationMetadataObject, sensitivity),
        );
    }, []);

    const onTriggerIntervalChange = useCallback((triggerInterval: IAlertTriggerInterval, dirty = true) => {
        setTriggerIntervalDirty(dirty);
        setEditedAutomation((s): IAutomationMetadataObjectDefinition | undefined =>
            s
                ? {
                      ...s,
                      alert: { ...s.alert!, trigger: { ...s.alert!.trigger, interval: triggerInterval } },
                  }
                : undefined,
        );
    }, []);

    const onGranularityChange = useCallback(
        (measure: AlertMetric | undefined, granularity: IAlertAnomalyDetectionGranularity) => {
            if (!measure) {
                return;
            }
            setEditedAutomation((alert) =>
                transformAlertByGranularity(
                    supportedMeasures,
                    alert as IAutomationMetadataObject,
                    measure,
                    granularity,
                    weekStart,
                ),
            );
            if (!triggerIntervalDirty) {
                onTriggerIntervalChange(granularity === "HOUR" ? "DAY" : granularity, false);
            }
        },
        [onTriggerIntervalChange, supportedMeasures, triggerIntervalDirty, weekStart],
    );

    const onDestinationChange = useCallback(
        (destinationId: string) => {
            const previousDestination = notificationChannels.find(
                (channel) => alertToEdit?.notificationChannel === channel.id,
            );
            const selectedDestination = notificationChannels.find((channel) => destinationId === channel.id);

            /**
             * When allowed recipients are changed from "ALL" to "CREATOR", show warning message
             */
            const showWarningMessage =
                selectedDestination?.allowedRecipients === "creator" &&
                previousDestination?.allowedRecipients !== "creator";

            setWarningMessage(
                showWarningMessage
                    ? intl.formatMessage({ id: "insightAlert.config.warning.destination" })
                    : undefined,
            );

            /**
             * Reset recipients when new notification channel only allows the author/creator
             */
            const updatedRecipients =
                selectedDestination?.allowedRecipients === "creator"
                    ? [convertCurrentUserToAutomationRecipient(users ?? [], currentUser)]
                    : undefined;

            setEditedAutomation((alert) =>
                alert
                    ? transformAlertByDestination(
                          alert as IAutomationMetadataObject,
                          destinationId,
                          updatedRecipients,
                      )
                    : undefined,
            );
        },
        [alertToEdit?.notificationChannel, currentUser, notificationChannels, intl, users],
    );

    const onTriggerModeChange = useCallback((triggerMode: IAlertTriggerMode) => {
        setEditedAutomation((s): IAutomationMetadataObjectDefinition | undefined =>
            s
                ? {
                      ...s,
                      alert: { ...s.alert!, trigger: { ...s.alert!.trigger, mode: triggerMode } },
                  }
                : undefined,
        );
    }, []);

    const onRecipientsChange = useCallback((updatedRecipients: IAutomationRecipient[]): void => {
        setEditedAutomation((s) =>
            s
                ? {
                      ...s,
                      recipients: updatedRecipients,
                  }
                : undefined,
        );
    }, []);

    const onFiltersChange = useCallback(
        (filters: FilterContextItem[]) => {
            setEditedAutomationFilters(filters);
            setEditedAutomation((s) => {
                if (!s) {
                    return undefined;
                }

                const appliedFilters = getAppliedWidgetFilters(
                    filters,
                    dashboardHiddenFilters,
                    widget,
                    insight,
                    commonDateFilterId,
                    true,
                    !s.metadata?.widget,
                );
                const visibleFilters = getVisibleFiltersByFilters(
                    filters,
                    availableFiltersAsVisibleFilters,
                    true,
                );

                const updatedAutomationWithFilters = {
                    ...s,
                    alert: {
                        ...s.alert!,
                        execution: {
                            ...s.alert!.execution,
                            filters: appliedFilters,
                        },
                    },
                    metadata: {
                        ...s.metadata,
                        visibleFilters,
                    },
                };

                const updatedAutomationWithAttribute = transformAlertByAttribute(
                    supportedAttributes,
                    updatedAutomationWithFilters as IAutomationMetadataObject,
                    selectedAttribute,
                    {
                        name: selectedValue ?? "",
                        title: "",
                        value: "",
                    },
                );

                return selectedMeasure
                    ? transformAlertByMetric(
                          supportedMeasures,
                          updatedAutomationWithAttribute,
                          selectedMeasure,
                          measureFormatMap,
                          weekStart,
                          timezone,
                      )
                    : updatedAutomationWithAttribute;
            });
        },
        [
            setEditedAutomationFilters,
            setEditedAutomation,
            availableFiltersAsVisibleFilters,
            widget,
            insight,
            dashboardHiddenFilters,
            commonDateFilterId,
            //
            selectedAttribute,
            selectedValue,
            supportedAttributes,
            //
            selectedMeasure,
            supportedMeasures,
            measureFormatMap,
            //
            weekStart,
            timezone,
        ],
    );

    const onApplyCurrentFilters = useCallback(() => {
        onFiltersChange(filtersForNewAutomation);
    }, [filtersForNewAutomation, onFiltersChange]);

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
