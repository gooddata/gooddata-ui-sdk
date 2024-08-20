// (C) 2022-2024 GoodData Corporation
import { useState } from "react";
import {
    IAlertComparisonOperator,
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IMeasure,
} from "@gooddata/sdk-model";
import isEqual from "lodash/isEqual.js";
import { getComparisonOperatorTitle, getMeasureTitle } from "../utils.js";
import { useIntl } from "react-intl";

export interface IUseEditAlertProps {
    alert: IAutomationMetadataObject;
    onCreate?: (alert: IAutomationMetadataObjectDefinition) => void;
    onUpdate?: (alert: IAutomationMetadataObject) => void;
}

export const useEditAlert = ({ alert, onCreate, onUpdate }: IUseEditAlertProps) => {
    const [viewMode, setViewMode] = useState<"edit" | "configuration">("edit");
    const [updatedAlert, setUpdatedAlert] = useState<IAutomationMetadataObject>(alert);
    const intl = useIntl();

    const changeMeasure = (measure: IMeasure) => {
        setUpdatedAlert((alert) => ({
            ...alert,
            title: getMeasureTitle(measure) ?? "",
            description: `${getComparisonOperatorTitle(updatedAlert.alert!.condition.operator, intl)} ${
                alert.alert!.condition.right
            }`,
            alert: {
                ...alert.alert!,
                condition: {
                    ...alert.alert!.condition,
                    left: measure.measure.localIdentifier,
                },
                execution: {
                    ...alert.alert!.execution,
                    measures: [measure],
                },
            },
        }));
    };

    const changeComparisonOperator = (comparisonOperator: IAlertComparisonOperator) => {
        setUpdatedAlert((alert) => ({
            ...alert,
            description: `${getComparisonOperatorTitle(comparisonOperator, intl)} ${
                updatedAlert.alert!.condition.right
            }`,
            alert: {
                ...alert.alert!,
                condition: {
                    ...alert.alert!.condition,
                    operator: comparisonOperator,
                },
            },
        }));
    };

    const changeValue = (value: number) => {
        setUpdatedAlert((alert) => ({
            ...alert,
            description: `${getComparisonOperatorTitle(updatedAlert.alert!.condition.operator, intl)} ${
                alert.alert!.condition.right
            }`,
            alert: {
                ...alert.alert!,
                condition: {
                    ...alert.alert!.condition,
                    right: value,
                },
            },
        }));
    };

    const changeDestination = (destinationId: string) => {
        setUpdatedAlert((alert) => ({
            ...alert,
            webhook: destinationId,
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

    const isValueDefined = typeof updatedAlert.alert?.condition.right !== "undefined";
    const isAlertChanged = !isEqual(updatedAlert, alert);
    const canSubmit = isValueDefined && isAlertChanged;

    return {
        viewMode,
        updatedAlert,
        canSubmit,
        //
        changeComparisonOperator,
        changeMeasure,
        changeValue,
        changeDestination,
        //
        configureAlert,
        saveAlertConfiguration,
        cancelAlertConfiguration,
        //
        createAlert,
        updateAlert,
    };
};
