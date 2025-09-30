// (C) 2022-2025 GoodData Corporation

import { ChangeEvent, FocusEvent, useCallback, useEffect, useState } from "react";

import { useIntl } from "react-intl";

import {
    IAlertRelativeArithmeticOperator,
    IAlertRelativeOperator,
    IAttribute,
    IAutomationAlert,
    IMeasure,
} from "@gooddata/sdk-model";

import { AlertAttribute, AlertMetric } from "../../types.js";
import { getAlertThreshold, getMeasureFormat } from "../utils/getters.js";
import { convertThresholdValue } from "../utils/threshold.js";

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
            changeValue(undefined!);
            setValue(undefined);

            // If user select comparison operator try to calculate the value based on the selected measure and attribute
        } else {
            const val = getMetricValue(selectedMeasure?.measure, selectedAttribute?.attribute, selectedValue);
            if (val !== undefined) {
                changeValue(val);
                setValue(convertThresholdValue(String(val), selectedMeasure?.measure.measure.format));
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
        (e: string | number, event?: ChangeEvent<HTMLInputElement>) => {
            const val = e === "" ? undefined : parseFloat(String(e));
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
