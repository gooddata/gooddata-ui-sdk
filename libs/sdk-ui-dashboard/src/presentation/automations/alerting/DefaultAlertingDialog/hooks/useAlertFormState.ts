// (C) 2026 GoodData Corporation

import { type Dispatch, type SetStateAction, useCallback, useState } from "react";

import { useIntl } from "react-intl";

import {
    type DateAttributeGranularity,
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
    type INotificationChannelIdentifier,
    type INotificationChannelMetadataObject,
    type IUser,
    type IWorkspaceUser,
    type WeekStart,
} from "@gooddata/sdk-model";

import { convertCurrentUserToAutomationRecipient } from "../../../shared/utils/automationUtils.js";
import { type AlertAttribute, type AlertMetric, type AlertMetricComparatorType } from "../../types.js";
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

/**
 * Props for {@link useAlertFormState}.
 * @internal
 */
export interface IUseAlertFormStateProps {
    setEditedAutomation: Dispatch<SetStateAction<IAutomationMetadataObjectDefinition | undefined>>;
    supportedMeasures: AlertMetric[];
    supportedAttributes: AlertAttribute[];
    measureFormatMap: IMeasureFormatMap;
    weekStart: WeekStart;
    timezone: string | undefined;
    enableAlertOncePerInterval: boolean;
    notificationChannels: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];
    currentUser: IUser;
    users: IWorkspaceUser[];
    alertToEdit?: IAutomationMetadataObject;
}

/**
 * Extracts the alerting dialog's form change-handlers and their local UI state out of `useEditAlert`
 * into a focused hook. Pure refactor — no behavior change.
 *
 * Part 1 of 2: this hook receives `setEditedAutomation` (and the derived inputs) as params; the
 * `editedAutomation` draft, its `createDefaultAlert` initializer, `originalAutomation`, and
 * `useAutomationAlertParameters` stay in `useEditAlert` for now and fold into this hook in a
 * follow-up.
 *
 * All inputs are params except `intl`, which the hook reads via `useIntl()` internally
 * (`onDestinationChange` formats a warning message).
 *
 * @internal
 */
export function useAlertFormState({
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
}: IUseAlertFormStateProps) {
    const intl = useIntl();

    // Local state
    const [warningMessage, setWarningMessage] = useState<string | undefined>(undefined);
    const [isTitleValid, setIsTitleValid] = useState(true);
    const [triggerIntervalDirty, setTriggerIntervalDirty] = useState(false);

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
        [
            setEditedAutomation,
            alertToEdit?.notificationChannel,
            currentUser,
            notificationChannels,
            intl,
            users,
        ],
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
