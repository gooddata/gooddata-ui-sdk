// (C) 2026 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

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
} from "@gooddata/sdk-model";

import { useAlertingDialogContext } from "../../contexts/AlertingDialogContext.js";
import { useAutomationsContext } from "../../contexts/AutomationsContext.js";
import { setAlertExecutionParameters } from "../../shared/automationFilters/automationParameters.js";
import { useAutomationAlertParameters } from "../../shared/automationFilters/useAutomationAlertParameters.js";
import {
    getAppliedWidgetFilters,
    getVisibleFiltersByFilters,
    resolveFilterDimensionalityLocalRefs,
} from "../../shared/filters/index.js";
import { isAutomationTitleValid } from "../../shared/utils/automationTitle.js";
import {
    convertExternalRecipientToAutomationRecipient,
    convertUserToAutomationRecipient,
} from "../../shared/utils/automationUtils.js";
import { type AlertAttribute, type AlertMetric, type AlertMetricComparatorType } from "../types.js";
import { createDefaultAlert } from "../utils/convertors.js";
import { type IMeasureFormatMap } from "../utils/getters.js";
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

import { type IAlertFormState } from "./types.js";

/**
 * Props for {@link useAlertFormState}.
 * @internal
 */
export interface IUseAlertFormStateProps {
    alertToEdit?: IAutomationMetadataObject;
    insight?: IInsight;
    widget?: IWidget;
    notificationChannels: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];
    editedAutomationFilters?: FilterContextItem[];
    availableFiltersAsVisibleFilters?: IAutomationVisibleFilter[] | undefined;
    externalRecipientOverride?: string;
    supportedMeasures: AlertMetric[];
    supportedAttributes: AlertAttribute[];
    measureFormatMap: IMeasureFormatMap;
}

/**
 * Owns the alerting dialog's editable state: the `editedAutomation` draft (initialized either
 * from `alertToEdit` or via `createDefaultAlert`), its `originalAutomation` baseline, the
 * automation's execution parameters, and the form's change-handlers and local UI state.
 *
 * Dashboard configuration (`weekStart`, `timezone`, `enableAlertOncePerInterval`, `currentUser`)
 * is read from {@link useAutomationsContext} and {@link useAlertingDialogContext} rather than
 * passed in as props. All other inputs are params, except `intl`, which is read via `useIntl()`.
 *
 * @internal
 */
export function useAlertFormState({
    alertToEdit,
    insight,
    widget,
    notificationChannels,
    editedAutomationFilters,
    availableFiltersAsVisibleFilters,
    externalRecipientOverride,
    supportedMeasures,
    supportedAttributes,
    measureFormatMap,
}: IUseAlertFormStateProps): IAlertFormState {
    const intl = useIntl();

    const {
        weekStart,
        timezone,
        settings,
        currentUser,
        widgetLocalIdToTabIdMap: widgetTabMap,
        features: { enableAlertOncePerInterval },
        exportTimezones,
    } = useAutomationsContext();

    const {
        dashboardId,
        hiddenFilters: dashboardHiddenFilters,
        commonDateFilterId,
        dashboardEvaluationFrequency,
        parameterValues,
        dashboardParameters,
    } = useAlertingDialogContext();

    // Determine target tab ID if widget is present
    const targetTabIdentifier = widget?.localIdentifier ? widgetTabMap[widget.localIdentifier] : undefined;

    // Default values
    const defaultMeasure = supportedMeasures[0];
    const defaultUser = useMemo(() => convertUserToAutomationRecipient(currentUser), [currentUser]);
    const defaultRecipient = useMemo(
        () =>
            externalRecipientOverride
                ? convertExternalRecipientToAutomationRecipient(externalRecipientOverride)
                : convertUserToAutomationRecipient(currentUser),
        [externalRecipientOverride, currentUser],
    );
    const defaultNotificationChannelId = notificationChannels[0]?.id;

    const resolvedAlertToEdit = (() => {
        if (!alertToEdit) {
            return undefined;
        }
        const filters = alertToEdit.alert?.execution?.filters;
        if (!alertToEdit.alert || !filters?.length || !insight) {
            return alertToEdit;
        }
        const resolvedFilters = resolveFilterDimensionalityLocalRefs(filters, insight);
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
                // defined only when the effective timezone comes from a dashboard-scoped source
                // (view-mode override, browser resolution, dashboard configuration) — the alert
                // evaluation service resolves the settings hierarchy itself
                exportTimezones?.effectiveTimezone,
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
    } = useAutomationAlertParameters({
        editedAutomation,
        setEditedAutomation,
        dashboardParameters,
        widgetParameterValues: parameterValues,
    });

    // Local state
    const [warningMessage, setWarningMessage] = useState<string | undefined>(undefined);
    const [isTitleValid, setIsTitleValid] = useState(true);
    const [triggerIntervalDirty, setTriggerIntervalDirty] = useState(false);

    //
    // Handlers
    //
    const onTitleChange = useCallback(
        (value: string) => {
            setIsTitleValid(isAutomationTitleValid(value));
            setEditedAutomation((s) => (s ? { ...s, title: value } : undefined));
        },
        [setEditedAutomation],
    );

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
        [setEditedAutomation, measureFormatMap, supportedMeasures, weekStart, timezone],
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
        [setEditedAutomation, supportedAttributes],
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
        [setEditedAutomation, supportedMeasures],
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
        [setEditedAutomation, measureFormatMap, supportedMeasures],
    );

    const onAnomalyDetectionChange = useCallback(
        (measure: AlertMetric) => {
            setTriggerIntervalDirty(false);
            setEditedAutomation((alert) =>
                alert
                    ? transformAlertByAnomalyDetection(
                          supportedMeasures,
                          alert as IAutomationMetadataObject,
                          measure,
                          weekStart,
                          timezone,
                          enableAlertOncePerInterval,
                      )
                    : undefined,
            );
        },
        [setEditedAutomation, supportedMeasures, weekStart, timezone, enableAlertOncePerInterval],
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
        [setEditedAutomation, measureFormatMap, supportedMeasures],
    );

    const onSensitivityChange = useCallback(
        (sensitivity: IAlertAnomalyDetectionSensitivity) => {
            setEditedAutomation((alert) =>
                alert
                    ? transformAlertBySensitivity(alert as IAutomationMetadataObject, sensitivity)
                    : undefined,
            );
        },
        [setEditedAutomation],
    );

    const onTriggerIntervalChange = useCallback(
        (triggerInterval: IAlertTriggerInterval, dirty = true) => {
            setTriggerIntervalDirty(dirty);
            setEditedAutomation((s): IAutomationMetadataObjectDefinition | undefined =>
                s
                    ? {
                          ...s,
                          alert: {
                              ...s.alert!,
                              trigger: { ...s.alert!.trigger, interval: triggerInterval },
                          },
                      }
                    : undefined,
            );
        },
        [setEditedAutomation],
    );

    const onGranularityChange = useCallback(
        (measure: AlertMetric | undefined, granularity: IAlertAnomalyDetectionGranularity) => {
            if (!measure) {
                return;
            }
            setEditedAutomation((alert) =>
                alert
                    ? transformAlertByGranularity(
                          supportedMeasures,
                          alert as IAutomationMetadataObject,
                          measure,
                          granularity,
                          weekStart,
                      )
                    : undefined,
            );
            if (!triggerIntervalDirty) {
                onTriggerIntervalChange(granularity === "HOUR" ? "DAY" : granularity, false);
            }
        },
        [setEditedAutomation, onTriggerIntervalChange, supportedMeasures, triggerIntervalDirty, weekStart],
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
                    ? [convertUserToAutomationRecipient(currentUser)]
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
        [setEditedAutomation, alertToEdit?.notificationChannel, currentUser, notificationChannels, intl],
    );

    const onTriggerModeChange = useCallback(
        (triggerMode: IAlertTriggerMode) => {
            setEditedAutomation((s): IAutomationMetadataObjectDefinition | undefined =>
                s
                    ? {
                          ...s,
                          alert: { ...s.alert!, trigger: { ...s.alert!.trigger, mode: triggerMode } },
                      }
                    : undefined,
            );
        },
        [setEditedAutomation],
    );

    const onRecipientsChange = useCallback(
        (updatedRecipients: IAutomationRecipient[]): void => {
            setEditedAutomation((s) =>
                s
                    ? {
                          ...s,
                          recipients: updatedRecipients,
                      }
                    : undefined,
            );
        },
        [setEditedAutomation],
    );

    return {
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
    };
}
