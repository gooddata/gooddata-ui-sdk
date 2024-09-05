// (C) 2022-2024 GoodData Corporation
import { useState } from "react";
import {
    IAlertComparisonOperator,
    IAlertRelativeArithmeticOperator,
    IAlertRelativeOperator,
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
} from "@gooddata/sdk-model";
import isEqual from "lodash/isEqual.js";
import {
    isAlertValueDefined,
    transformAlertByComparisonOperator,
    transformAlertByDestination,
    transformAlertByMetric,
    transformAlertByRelativeOperator,
    transformAlertByValue,
} from "../utils.js";
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
        setUpdatedAlert((alert) => transformAlertByMetric(alert, measure));
    };

    const changeComparisonOperator = (comparisonOperator: IAlertComparisonOperator) => {
        setUpdatedAlert((alert) => transformAlertByComparisonOperator(alert, comparisonOperator));
    };

    const changeRelativeOperator = (
        relativeOperator: IAlertRelativeOperator,
        arithmeticOperator: IAlertRelativeArithmeticOperator,
    ) => {
        setUpdatedAlert((alert) =>
            transformAlertByRelativeOperator(alert, relativeOperator, arithmeticOperator),
        );
    };

    const changeValue = (value: number) => {
        setUpdatedAlert((alert) => transformAlertByValue(alert, value));
    };

    const changeDestination = (destinationId: string) => {
        setUpdatedAlert((alert) => transformAlertByDestination(alert, destinationId));
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
    const isAlertChanged = !isEqual(updatedAlert, alert);
    const canSubmit = isValueDefined && isAlertChanged;

    return {
        viewMode,
        updatedAlert,
        canSubmit,
        //
        changeComparisonOperator,
        changeRelativeOperator,
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
