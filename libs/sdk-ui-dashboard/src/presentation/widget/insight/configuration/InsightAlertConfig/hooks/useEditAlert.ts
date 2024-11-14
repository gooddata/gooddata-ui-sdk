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
    ICatalogAttribute,
    ICatalogDateDataset,
    ICatalogMeasure,
    INotificationChannelMetadataObject,
    isAutomationUserRecipient,
} from "@gooddata/sdk-model";
import isEqual from "lodash/isEqual.js";
import { isAlertRecipientsValid, isAlertValueDefined } from "../utils/guards.js";
import {
    transformAlertByAttribute,
    transformAlertByComparisonOperator,
    transformAlertByDestination,
    transformAlertByMetric,
    transformAlertByRelativeOperator,
    transformAlertByValue,
} from "../utils/transformation.js";
import { AlertAttribute, AlertMetric, AlertMetricComparatorType } from "../../../types.js";
import { selectCurrentUser, selectUsers, useDashboardSelector } from "../../../../../../model/index.js";
import { convertCurrentUserToAutomationRecipient } from "../../../../../../_staging/automation/index.js";
import { isEmail } from "../../../../../scheduledEmail/DefaultScheduledEmailDialog/utils/validate.js";

export interface IUseEditAlertProps {
    metrics: AlertMetric[];
    attributes: AlertAttribute[];
    alert: IAutomationMetadataObject;
    catalogMeasures: ICatalogMeasure[];
    catalogAttributes: ICatalogAttribute[];
    catalogDateDatasets: ICatalogDateDataset[];
    destinations: INotificationChannelMetadataObject[];
    onCreate?: (alert: IAutomationMetadataObjectDefinition) => void;
    onUpdate?: (alert: IAutomationMetadataObject) => void;
}

export const useEditAlert = ({
    metrics,
    attributes,
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
    const users = useDashboardSelector(selectUsers);
    const intl = useIntl();

    const selectedDestination = destinations.find(
        (destination) => destination.id === updatedAlert.notificationChannel,
    );
    const showRecipientsSelect = selectedDestination?.allowedRecipients !== "CREATOR";

    const changeMeasure = (measure: AlertMetric) => {
        setUpdatedAlert((alert) => transformAlertByMetric(metrics, alert, measure, catalogMeasures));
    };

    const changeAttribute = (
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
                ? [convertCurrentUserToAutomationRecipient(users, currentUser)]
                : undefined;

        setUpdatedAlert((alert) => transformAlertByDestination(alert, destinationId, updatedRecipients));
    };

    const changeComparisonType = (
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
                catalogMeasures,
                comparisonType,
            ),
        );
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
    const areEmailsValid =
        selectedDestination?.type === "smtp"
            ? updatedAlert.recipients?.every((v) =>
                  isAutomationUserRecipient(v) ? isEmail(v.email ?? "") : true,
              )
            : true;

    const canSubmit = isValueDefined && isAlertChanged && isRecipientsValid && areEmailsValid;

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
        changeAttribute,
        changeValue,
        changeDestination,
        changeComparisonType,
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
