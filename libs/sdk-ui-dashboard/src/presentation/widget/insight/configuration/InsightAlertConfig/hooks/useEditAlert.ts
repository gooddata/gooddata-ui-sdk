// (C) 2022-2025 GoodData Corporation
import { useCallback, useState } from "react";
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
    INotificationChannelIdentifier,
    INotificationChannelMetadataObject,
    isAutomationExternalUserRecipient,
    isAutomationUnknownUserRecipient,
    isAutomationUserRecipient,
    ISeparators,
} from "@gooddata/sdk-model";
import isEqual from "lodash/isEqual.js";
import {
    selectCurrentUser,
    selectEnableExternalRecipients,
    selectUsers,
    useDashboardSelector,
} from "../../../../../../model/index.js";
import {
    convertCurrentUserToAutomationRecipient,
    convertCurrentUserToWorkspaceUser,
} from "../../../../../../_staging/automation/index.js";
import { isEmail } from "../../../../../scheduledEmail/utils/validate.js";
import {
    getDescription,
    IMeasureFormatMap,
} from "../../../../../alerting/DefaultAlertingDialog/utils/getters.js";
import {
    transformAlertByAttribute,
    transformAlertByComparisonOperator,
    transformAlertByDestination,
    transformAlertByMetric,
    transformAlertByRelativeOperator,
    transformAlertByTitle,
    transformAlertByValue,
} from "../../../../../alerting/DefaultAlertingDialog/utils/transformation.js";
import {
    isAlertRecipientsValid,
    isAlertValueDefined,
} from "../../../../../alerting/DefaultAlertingDialog/utils/guards.js";
import { AlertAttribute, AlertMetric, AlertMetricComparatorType } from "../../../../../alerting/types.js";

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
            setUpdatedAlert((alert) => transformAlertByMetric(metrics, alert, measure, measureFormatMap));
        },
        [measureFormatMap, metrics],
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
        //
        changeComparisonOperator,
        changeRelativeOperator,
        changeMeasure,
        changeAttribute,
        changeValue,
        changeTitle,
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
