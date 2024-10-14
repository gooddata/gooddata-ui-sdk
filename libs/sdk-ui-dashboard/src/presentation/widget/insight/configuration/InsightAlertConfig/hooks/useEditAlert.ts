// (C) 2022-2024 GoodData Corporation
import { useState } from "react";
import { useIntl } from "react-intl";
import {
    IAlertComparisonOperator,
    IAlertRelativeArithmeticOperator,
    IAlertRelativeOperator,
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IAutomationRecipient,
    ICatalogMeasure,
    INotificationChannelMetadataObject,
} from "@gooddata/sdk-model";
import isEqual from "lodash/isEqual.js";
import {
    isAlertRecipientsValid,
    isAlertValueDefined,
    transformAlertByComparisonOperator,
    transformAlertByDestination,
    transformAlertByMetric,
    transformAlertByRelativeOperator,
    transformAlertByValue,
} from "../utils.js";
import { AlertMetric } from "../../../types.js";
import { selectCurrentUser, useDashboardSelector } from "../../../../../../model/index.js";
import { convertUserToAutomationRecipient } from "../../../../../../_staging/automation/index.js";

export interface IUseEditAlertProps {
    metrics: AlertMetric[];
    alert: IAutomationMetadataObject;
    catalogMeasures: ICatalogMeasure[];
    destinations: INotificationChannelMetadataObject[];
    onCreate?: (alert: IAutomationMetadataObjectDefinition) => void;
    onUpdate?: (alert: IAutomationMetadataObject) => void;
}

export const useEditAlert = ({
    metrics,
    alert,
    onCreate,
    onUpdate,
    catalogMeasures,
    destinations,
}: IUseEditAlertProps) => {
    const [viewMode, setViewMode] = useState<"edit" | "configuration">("edit");
    const [updatedAlert, setUpdatedAlert] = useState<IAutomationMetadataObject>(alert);
    const [warningMessage, setWarningMessage] = useState<string | undefined>(undefined);
    const currentUser = useDashboardSelector(selectCurrentUser);
    const intl = useIntl();

    const selectedDestination = destinations.find(
        (destination) => destination.id === updatedAlert.notificationChannel,
    );
    const showRecipientsSelect = selectedDestination?.allowedRecipients !== "CREATOR";

    const changeMeasure = (measure: AlertMetric) => {
        setUpdatedAlert((alert) => transformAlertByMetric(metrics, alert, measure, catalogMeasures));
    };

    const changeComparisonOperator = (measure: AlertMetric, comparisonOperator: IAlertComparisonOperator) => {
        setUpdatedAlert((alert) =>
            transformAlertByComparisonOperator(metrics, alert, measure, comparisonOperator),
        );
    };

    const changeRelativeOperator = (
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
                catalogMeasures,
            ),
        );
    };

    const changeValue = (value: number) => {
        setUpdatedAlert((alert) => transformAlertByValue(alert, value));
    };

    const changeDestination = (destinationId: string) => {
        const previousDestination = destinations.find((channel) => alert.notificationChannel === channel.id);
        const selectedDestination = destinations.find((channel) => destinationId === channel.id);

        /**
         * When allowed recipients are changed from "ALL" to "CREATOR", show warning message
         */
        const showWarningMessage =
            selectedDestination?.allowedRecipients === "CREATOR" &&
            previousDestination?.allowedRecipients !== "CREATOR";
        setWarningMessage(
            showWarningMessage
                ? intl.formatMessage({ id: "insightAlert.config.warning.destination" })
                : undefined,
        );

        /**
         * Reset recipients when new notification channel only allows the author/creator
         */
        const updatedRecipients =
            selectedDestination?.allowedRecipients === "CREATOR"
                ? [convertUserToAutomationRecipient(currentUser)]
                : undefined;

        setUpdatedAlert((alert) => transformAlertByDestination(alert, destinationId, updatedRecipients));
    };

    const changeRecipients = (recipients: IAutomationRecipient[]) => {
        setUpdatedAlert((alert) => ({
            ...alert,
            recipients,
        }));
    };

    const configureAlert = () => {
        setViewMode("configuration");
    };

    const saveAlertConfiguration = (alert: IAutomationMetadataObject) => {
        setUpdatedAlert(alert);
        cancelAlertConfiguration();
    };

    const cancelAlertConfiguration = () => {
        setViewMode("edit");
    };

    const createAlert = () => {
        onCreate?.(updatedAlert);
    };

    const updateAlert = () => {
        onUpdate?.(updatedAlert as IAutomationMetadataObject);
    };

    const isValueDefined = isAlertValueDefined(updatedAlert.alert);
    const isRecipientsValid = isAlertRecipientsValid(updatedAlert);
    const isAlertChanged = !isEqual(updatedAlert, alert);
    const canSubmit = isValueDefined && isAlertChanged && isRecipientsValid;

    return {
        viewMode,
        updatedAlert,
        canSubmit,
        showRecipientsSelect,
        warningMessage,
        //
        changeComparisonOperator,
        changeRelativeOperator,
        changeMeasure,
        changeValue,
        changeDestination,
        changeRecipients,
        //
        configureAlert,
        saveAlertConfiguration,
        cancelAlertConfiguration,
        //
        createAlert,
        updateAlert,
    };
};
