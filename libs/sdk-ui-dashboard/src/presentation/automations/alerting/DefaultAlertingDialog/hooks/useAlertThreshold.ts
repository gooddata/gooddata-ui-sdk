// (C) 2026 GoodData Corporation

import { type Dispatch, type SetStateAction, useCallback } from "react";

import {
    type IAlertRelativeArithmeticOperator,
    type IAlertRelativeOperator,
    type IAttribute,
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type IMeasure,
} from "@gooddata/sdk-model";

import { type AlertAttribute, type AlertMetric } from "../../types.js";
import { transformAlertByValue } from "../utils/transformation.js";

import { useThresholdValue } from "./useThresholdValue.js";

export interface IUseAlertThresholdProps {
    setEditedAutomation: Dispatch<SetStateAction<IAutomationMetadataObjectDefinition | undefined>>;
    editedAutomation: IAutomationMetadataObjectDefinition | undefined;
    getMetricValue: (measure?: IMeasure, attr?: IAttribute, value?: string | null) => number | undefined;
    isNewAlert: boolean;
    selectedRelativeOperator: [IAlertRelativeOperator, IAlertRelativeArithmeticOperator] | undefined;
    selectedMeasure: AlertMetric | undefined;
    selectedAttribute: AlertAttribute | undefined;
    selectedValue: string | null | undefined;
}

export function useAlertThreshold({
    setEditedAutomation,
    editedAutomation,
    getMetricValue,
    isNewAlert,
    selectedRelativeOperator,
    selectedMeasure,
    selectedAttribute,
    selectedValue,
}: IUseAlertThresholdProps) {
    const onValueChange = useCallback(
        (value: number) => {
            setEditedAutomation((alert) =>
                alert ? transformAlertByValue(alert as IAutomationMetadataObject, value) : undefined,
            );
        },
        [setEditedAutomation],
    );

    const {
        value,
        onChange,
        onBlur,
        errorMessage: thresholdErrorMessage,
    } = useThresholdValue(
        onValueChange,
        getMetricValue,
        isNewAlert,
        editedAutomation?.alert,
        selectedRelativeOperator,
        selectedMeasure,
        selectedAttribute,
        selectedValue,
    );

    return {
        value,
        onChange,
        onBlur,
        thresholdErrorMessage,
    };
}
