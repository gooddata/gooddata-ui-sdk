// (C) 2022-2025 GoodData Corporation

import { useCallback, useState } from "react";

import { isEqual } from "lodash-es";
import { useIntl } from "react-intl";

import {
    IAlertAnomalyDetectionGranularity,
    IAlertAnomalyDetectionSensitivity,
    IAlertComparisonOperator,
    IAlertRelativeArithmeticOperator,
    IAlertRelativeOperator,
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IAutomationRecipient,
    ICatalogAttribute,
    ICatalogDateDataset,
    INotificationChannelIdentifier,
    INotificationChannelMetadataObject,
    ISeparators,
    isAutomationExternalUserRecipient,
    isAutomationUnknownUserRecipient,
    isAutomationUserRecipient,
} from "@gooddata/sdk-model";

import {
    convertCurrentUserToAutomationRecipient,
    convertCurrentUserToWorkspaceUser,
} from "../../../../../../_staging/automation/index.js";
import {
    selectCurrentUser,
    selectEnableAnomalyDetectionAlert,
    selectEnableExternalRecipients,
    selectTimezone,
    selectUsers,
    selectWeekStart,
    useDashboardSelector,
} from "../../../../../../model/index.js";
import {
    IMeasureFormatMap,
    getDescription,
} from "../../../../../alerting/DefaultAlertingDialog/utils/getters.js";
import {
    isAlertRecipientsValid,
    isAlertValueDefined,
} from "../../../../../alerting/DefaultAlertingDialog/utils/guards.js";
import {
    transformAlertByAnomalyDetection,
    transformAlertByAttribute,
    transformAlertByComparisonOperator,
    transformAlertByDestination,
    transformAlertByGranularity,
    transformAlertByMetric,
    transformAlertByRelativeOperator,
    transformAlertBySensitivity,
    transformAlertByTitle,
    transformAlertByValue,
} from "../../../../../alerting/DefaultAlertingDialog/utils/transformation.js";
import { AlertAttribute, AlertMetric, AlertMetricComparatorType } from "../../../../../alerting/types.js";
import { isEmail } from "../../../../../scheduledEmail/utils/validate.js";

export interface IUseEditAlertProps {
    metrics: AlertMetric[];
    attributes: AlertAttribute[];
    alert: IAutomationMetadataObject;
    measureFormatMap: IMeasureFormatMap;
    catalogAttributes: ICatalogAttribute[];
    catalogDateDatasets: ICatalogDateDataset[];
    destinations: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];
    separators?: ISeparators;
    onCreate?: (alert: IAutomationMetadataObjectDefinition) => void;
    onUpdate?: (alert: IAutomationMetadataObject) => void;
}

export const useEditAlert = ({
    metrics,
    attributes,
    alert,
    onCreate,
    onUpdate,
    measureFormatMap,
    destinations,
    separators,
}: IUseEditAlertProps) => {
    const [viewMode, setViewMode] = useState<"edit" | "configuration">("edit");
    const [updatedAlert, setUpdatedAlert] = useState<IAutomationMetadataObject>(alert);
    const [warningMessage, setWarningMessage] = useState<string | undefined>(undefined);
    const currentUser = useDashboardSelector(selectCurrentUser);
    const users = useDashboardSelector(selectUsers);
    const enabledExternalRecipients = useDashboardSelector(selectEnableExternalRecipients);
    const enableAnomalyDetectionAlert = useDashboardSelector(selectEnableAnomalyDetectionAlert);
    const weekStart = useDashboardSelector(selectWeekStart);
    const timezone = useDashboardSelector(selectTimezone);
    const intl = useIntl();

    const selectedDestination = destinations.find(
        (destination) => destination.id === updatedAlert.notificationChannel,
    );
    const defaultUser = convertCurrentUserToWorkspaceUser(users ?? [], currentUser);
    const allowExternalRecipients =
        selectedDestination?.allowedRecipients === "external" && enabledExternalRecipients;
    const allowOnlyLoggedUserRecipients = selectedDestination?.allowedRecipients === "creator";

    const changeMeasure = useCallback(
        (measure: AlertMetric) => {
            setUpdatedAlert((alert) =>
                transformAlertByMetric(metrics, alert, measure, measureFormatMap, weekStart, timezone),
            );
        },
        [measureFormatMap, metrics, weekStart, timezone],
    );

    const changeAttribute = useCallback(
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
            setUpdatedAlert((alert) => transformAlertByAttribute(attributes, alert, attribute, value));
        },
        [attributes],
    );

    const changeComparisonOperator = useCallback(
        (measure: AlertMetric, comparisonOperator: IAlertComparisonOperator) => {
            setUpdatedAlert((alert) =>
                transformAlertByComparisonOperator(metrics, alert, measure, comparisonOperator),
            );
        },
        [metrics],
    );

    const changeAnomalyDetection = useCallback(
        (measure: AlertMetric) => {
            setUpdatedAlert((alert) =>
                transformAlertByAnomalyDetection(metrics, alert, measure, weekStart, timezone),
            );
        },
        [metrics, weekStart, timezone],
    );

    const changeRelativeOperator = useCallback(
        (
            measure: AlertMetric,
            relativeOperator: IAlertRelativeOperator,
            arithmeticOperator: IAlertRelativeArithmeticOperator,
        ) => {
            setUpdatedAlert((alert) =>
                transformAlertByRelativeOperator(
                    metrics,
                    alert,
                    measure,
                    relativeOperator,
                    arithmeticOperator,
                    measureFormatMap,
                ),
            );
        },
        [measureFormatMap, metrics],
    );

    const changeValue = useCallback((value: number) => {
        setUpdatedAlert((alert) => transformAlertByValue(alert, value));
    }, []);

    const changeTitle = useCallback((value: string | undefined) => {
        setUpdatedAlert((alert) => transformAlertByTitle(alert, value));
    }, []);

    const changeSensitivity = useCallback((value: IAlertAnomalyDetectionSensitivity) => {
        setUpdatedAlert((alert) => transformAlertBySensitivity(alert, value));
    }, []);

    const changeGranularity = useCallback(
        (measure: AlertMetric | undefined, value: IAlertAnomalyDetectionGranularity) => {
            if (!measure) {
                return;
            }
            setUpdatedAlert((alert) =>
                transformAlertByGranularity(metrics, alert, measure, value, weekStart),
            );
        },
        [metrics, weekStart],
    );

    const changeDestination = useCallback(
        (destinationId: string) => {
            const previousDestination = destinations.find(
                (channel) => alert.notificationChannel === channel.id,
            );
            const selectedDestination = destinations.find((channel) => destinationId === channel.id);

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

            setUpdatedAlert((alert) => transformAlertByDestination(alert, destinationId, updatedRecipients));
        },
        [alert.notificationChannel, currentUser, destinations, intl, users],
    );

    const changeComparisonType = useCallback(
        (
            measure: AlertMetric | undefined,
            relativeOperator: [IAlertRelativeOperator, IAlertRelativeArithmeticOperator] | undefined,
            comparisonType: AlertMetricComparatorType,
        ) => {
            if (!measure || !relativeOperator || !relativeOperator) {
                return;
            }
            const [relativeOperatorValue, arithmeticOperator] = relativeOperator;
            setUpdatedAlert((alert) =>
                transformAlertByRelativeOperator(
                    metrics,
                    alert,
                    measure,
                    relativeOperatorValue,
                    arithmeticOperator,
                    measureFormatMap,
                    comparisonType,
                ),
            );
        },
        [measureFormatMap, metrics],
    );

    const changeRecipients = useCallback((recipients: IAutomationRecipient[]) => {
        setUpdatedAlert((alert) => ({
            ...alert,
            recipients,
        }));
    }, []);

    const configureAlert = useCallback(() => {
        setViewMode("configuration");
    }, []);

    const cancelAlertConfiguration = useCallback(() => {
        setViewMode("edit");
    }, []);

    const saveAlertConfiguration = useCallback(
        (alert: IAutomationMetadataObject) => {
            setUpdatedAlert(alert);
            cancelAlertConfiguration();
        },
        [cancelAlertConfiguration],
    );

    const createAlert = useCallback(() => {
        const title = updatedAlert.title || getDescription(intl, metrics, updatedAlert, separators);
        onCreate?.({
            ...updatedAlert,
            title,
        });
    }, [intl, metrics, onCreate, separators, updatedAlert]);

    const updateAlert = useCallback(() => {
        const title = updatedAlert.title || getDescription(intl, metrics, updatedAlert, separators);
        onUpdate?.({
            ...updatedAlert,
            title,
        } as IAutomationMetadataObject);
    }, [intl, metrics, onUpdate, separators, updatedAlert]);

    const isValueDefined = isAlertValueDefined(updatedAlert.alert);
    const isRecipientsValid = isAlertRecipientsValid(updatedAlert);
    const isExternalRecipientsValid = allowExternalRecipients
        ? true
        : !updatedAlert.recipients?.some(isAutomationExternalUserRecipient);
    const hasNoUnknownRecipients = !updatedAlert.recipients?.some(isAutomationUnknownUserRecipient);
    const isAlertChanged = !isEqual(updatedAlert, alert);

    const areEmailsValid =
        selectedDestination?.destinationType === "smtp"
            ? updatedAlert.recipients?.every((v) =>
                  isAutomationUserRecipient(v) ? isEmail(v.email ?? "") : true,
              )
            : true;

    const canSubmit =
        isValueDefined &&
        isAlertChanged &&
        isRecipientsValid &&
        areEmailsValid &&
        isExternalRecipientsValid &&
        hasNoUnknownRecipients;

    return {
        defaultUser,
        viewMode,
        updatedAlert,
        canSubmit,
        allowOnlyLoggedUserRecipients,
        allowExternalRecipients,
        warningMessage,
        enableAnomalyDetectionAlert,
        //
        changeComparisonOperator,
        changeAnomalyDetection,
        changeRelativeOperator,
        changeMeasure,
        changeAttribute,
        changeValue,
        changeTitle,
        changeDestination,
        changeComparisonType,
        changeRecipients,
        changeSensitivity,
        changeGranularity,
        //
        configureAlert,
        saveAlertConfiguration,
        cancelAlertConfiguration,
        //
        createAlert,
        updateAlert,
    };
};
