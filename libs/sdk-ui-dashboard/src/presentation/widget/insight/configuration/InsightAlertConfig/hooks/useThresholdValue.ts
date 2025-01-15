// (C) 2022-2025 GoodData Corporation
import { useEffect, useState } from "react";
import {
    IAlertRelativeArithmeticOperator,
    IAlertRelativeOperator,
    IAttribute,
    IAutomationAlert,
    IMeasure,
} from "@gooddata/sdk-model";

import { getAlertThreshold } from "../utils/getters.js";
import { AlertAttribute, AlertMetric } from "../../../types.js";

export function useThresholdValue(
    changeValue: (value: number) => void,
    getMetricValue: (measure?: IMeasure, attr?: IAttribute, value?: string | null) => number | undefined,
    alert?: IAutomationAlert,
    selectedRelativeOperator: [
        IAlertRelativeOperator | undefined,
        IAlertRelativeArithmeticOperator | undefined,
    ] = [undefined, undefined],
    selectedMeasure?: AlertMetric,
    selectedAttribute?: AlertAttribute,
    selectedValue?: string | null,
) {
    const [relativeOperator] = selectedRelativeOperator;

    const value = getAlertThreshold(alert);
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        // If input is already touched, do not trigger current value calculation
        if (touched) {
            return;
        }

        // If user selects a relative operator, clear the value if not touched, it not make sense
        if (relativeOperator) {
            changeValue(undefined!);

            // If user select comparison operator try to calculate the value based on the selected measure and attribute
        } else {
            const val = getMetricValue(selectedMeasure?.measure, selectedAttribute?.attribute, selectedValue);
            if (val !== undefined) {
                changeValue(val);
            }
        }
    }, [
        changeValue,
        getMetricValue,
        selectedAttribute?.attribute,
        selectedMeasure?.measure,
        relativeOperator,
        selectedValue,
        touched,
    ]);

    return {
        value,
        setTouched,
    };
}
