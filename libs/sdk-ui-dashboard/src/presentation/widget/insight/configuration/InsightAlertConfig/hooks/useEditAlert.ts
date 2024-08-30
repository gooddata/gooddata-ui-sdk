// (C) 2022-2024 GoodData Corporation
import { useState } from "react";
import {
    IAlertComparisonOperator,
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
} from "@gooddata/sdk-model";
import isEqual from "lodash/isEqual.js";
import { getMeasureTitle } from "../utils.js";
import { AlertMetric } from "../../../types.js";

export interface IUseEditAlertProps {
    alert: IAutomationMetadataObject;
    onCreate?: (alert: IAutomationMetadataObjectDefinition) => void;
    onUpdate?: (alert: IAutomationMetadataObject) => void;
}

export const useEditAlert = ({ alert, onCreate, onUpdate }: IUseEditAlertProps) => {
    const [viewMode, setViewMode] = useState<"edit" | "configuration">("edit");
    const [updatedAlert, setUpdatedAlert] = useState<IAutomationMetadataObject>(alert);

    const changeMeasure = (measure: AlertMetric) => {
        setUpdatedAlert((alert) => ({
            ...alert,
            title: getMeasureTitle(measure.measure) ?? "",
            alert: {
                ...alert.alert!,
                condition: {
                    ...alert.alert!.condition,
                    left: measure.measure.measure.localIdentifier,
                },
                execution: {
                    ...alert.alert!.execution,
                    measures: [measure.measure],
                },
            },
        }));
    };

    const changeComparisonOperator = (comparisonOperator: IAlertComparisonOperator) => {
        setUpdatedAlert((alert) => ({
            ...alert,
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
            notificationChannel: destinationId,
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
