// (C) 2022-2025 GoodData Corporation
import React, { useCallback, useEffect, useState } from "react";
import { ClientFormatterFacade } from "@gooddata/number-formatter";
import {
    IAlertRelativeArithmeticOperator,
    IAlertRelativeOperator,
    IAttribute,
    IAutomationAlert,
    IMeasure,
} from "@gooddata/sdk-model";

import { getAlertThreshold, getMeasureFormat } from "../utils/getters.js";
import { AlertAttribute, AlertMetric } from "../../../types.js";

export function useThresholdValue(
    changeValue: (value: number) => void,
    getMetricValue: (measure?: IMeasure, attr?: IAttribute, value?: string | null) => number | undefined,
    isNewAlert?: boolean,
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

    const [value, setValue] = useState(getAlertThreshold(alert));
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        // If input is already touched, do not trigger current value calculation
        // If alert is not new, do not trigger current value calculation because it is already set by user
        if (touched || !isNewAlert) {
            return;
        }

        // If user selects a relative operator, clear the value if not touched, it not make sense
        if (relativeOperator) {
            changeValue(undefined!);
            setValue(undefined);

            // If user select comparison operator try to calculate the value based on the selected measure and attribute
        } else {
            const val = getMetricValue(selectedMeasure?.measure, selectedAttribute?.attribute, selectedValue);
            if (val !== undefined) {
                changeValue(val);
                setValue(convertValue(String(val), selectedMeasure?.measure.measure.format));
            }
        }
    }, [
        isNewAlert,
        changeValue,
        getMetricValue,
        selectedAttribute?.attribute,
        selectedMeasure?.measure,
        relativeOperator,
        selectedValue,
        touched,
    ]);

    const onChange = useCallback(
        (e: string | number, event?: React.ChangeEvent<HTMLInputElement>) => {
            const val = e !== "" ? parseFloat(String(e)) : undefined;
            changeValue(val!);
            setValue(val);
            // Set touched state when user changes the value
            if (event) {
                setTouched(true);
            }
        },
        [changeValue],
    );

    const onBlur = useCallback(
        (event: React.FocusEvent<HTMLInputElement>) => {
            const val = convertValue(event.target.value, getMeasureFormat(selectedMeasure?.measure));
            changeValue(val!);
            setValue(val);
        },
        [changeValue, selectedMeasure?.measure],
    );

    return {
        value,
        onChange,
        onBlur,
    };
}

function convertValue(value: string, format?: string): number | undefined {
    try {
        const convertedValue = ClientFormatterFacade.convertValue(value);
        const { formattedValue } = ClientFormatterFacade.formatValue(convertedValue, format, {
            decimal: ".",
            thousand: "",
        });
        return parseFormattedNumber(formattedValue);
    } catch {
        return parseFormattedNumber(value);
    }
}

function parseFormattedNumber(formattedNumber: string): number | undefined {
    // Remove any non-numeric characters except for decimal points
    const cleanedString = formattedNumber.replace(/[^\d.-]/g, "");

    // Parse and return the raw float number
    const rawNumber = parseFloat(cleanedString);

    // Check if the result is a valid number
    if (isNaN(rawNumber)) {
        return undefined;
    }

    return rawNumber;
}
