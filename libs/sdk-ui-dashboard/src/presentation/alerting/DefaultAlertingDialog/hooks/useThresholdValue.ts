// (C) 2022-2025 GoodData Corporation

import { type ChangeEvent, type FocusEvent, useCallback, useEffect, useState } from "react";

import { useIntl } from "react-intl";

import {
    type IAlertRelativeArithmeticOperator,
    type IAlertRelativeOperator,
    type IAttribute,
    type IAutomationAlert,
    type IMeasure,
} from "@gooddata/sdk-model";

import { type AlertAttribute, type AlertMetric } from "../../types.js";
import { getAlertThreshold, getMeasureFormat } from "../utils/getters.js";
import { convertThresholdValue } from "../utils/threshold.js";

function clearValueForRelativeOperator(
    changeValue: (value: number) => void,
    setValue: (value: number | undefined) => void,
) {
    changeValue(undefined!);
    setValue(undefined);
}

function calculateAndSetComparisonValue(
    getMetricValue: (measure?: IMeasure, attr?: IAttribute, value?: string | null) => number | undefined,
    changeValue: (value: number) => void,
    setValue: (value: number | undefined) => void,
    measure?: IMeasure,
    attribute?: IAttribute,
    selectedValue?: string | null,
) {
    const val = getMetricValue(measure, attribute, selectedValue);
    if (val === undefined) {
        return;
    }
    changeValue(val);
    setValue(convertThresholdValue(String(val), measure?.measure.format));
}

function parseInputValue(e: string | number): number | undefined {
    return e === "" ? undefined : parseFloat(String(e));
}

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
    const intl = useIntl();
    const [relativeOperator] = selectedRelativeOperator;

    const [value, setValue] = useState(getAlertThreshold(alert));
    const [touched, setTouched] = useState(false);
    const [hasValidationError, setHasValidationError] = useState(false);

    useEffect(() => {
        // If input is already touched, do not trigger current value calculation
        // If alert is not new, do not trigger current value calculation because it is already set by user
        if (touched || !isNewAlert) {
            return;
        }

        // If user selects a relative operator, clear the value if not touched, it not make sense
        if (relativeOperator) {
            clearValueForRelativeOperator(changeValue, setValue);
            return;
        }

        // If user select comparison operator try to calculate the value based on the selected measure and attribute
        calculateAndSetComparisonValue(
            getMetricValue,
            changeValue,
            setValue,
            selectedMeasure?.measure,
            selectedAttribute?.attribute,
            selectedValue,
        );
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
        (e: string | number, event?: ChangeEvent<HTMLInputElement>) => {
            const val = parseInputValue(e);
            if (val) {
                setHasValidationError(false);
            }
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
        (event: FocusEvent<HTMLInputElement>) => {
            const val = convertThresholdValue(event.target.value, getMeasureFormat(selectedMeasure?.measure));
            changeValue(val!);
            setValue(val);
            setTouched(true);

            const isEmpty = val === undefined || val === null;
            setHasValidationError(isEmpty);
        },
        [changeValue, selectedMeasure?.measure],
    );

    const showValidationError = touched && hasValidationError;
    const errorMessage = showValidationError
        ? intl.formatMessage({ id: "insightAlert.config.missingThreshold" })
        : undefined;

    return {
        value,
        onChange,
        onBlur,
        errorMessage,
    };
}
