// (C) 2019 GoodData Corporation
import get = require("lodash/get");
import set = require("lodash/set");
import { WrappedComponentProps } from "react-intl";
import { getTranslation } from "./translations";
import { IMinMaxControlState, IMinMaxControlProps } from "../interfaces/MinMaxControl";

export function fixEmptyMaxValue(value: string) {
    return value === "" ? Number.MAX_SAFE_INTEGER : Number(value);
}

export function fixEmptyMinValue(value: string) {
    return value === "" ? Number.MIN_SAFE_INTEGER : Number(value);
}

export function isValueMinusOrEmpty(value: string) {
    return value === "-" || value === "";
}

export function isInvalidOrMinMaxError(value: string, minNumberValue: number, maxNumberValue: number) {
    const valueIsMinus = value === "-";
    const maxMinNumbers = !isNaN(minNumberValue) && !isNaN(maxNumberValue);
    return valueIsMinus || !maxMinNumbers || minNumberValue > maxNumberValue;
}

export function maxInputValidateAndPushData(
    data: any,
    state: IMinMaxControlState,
    props: IMinMaxControlProps & WrappedComponentProps,
    setState: any,
    defaultState: IMinMaxControlState,
) {
    const { basePath } = props;
    const maxValue = get(data, `properties.controls.${basePath}.max`);
    const incorrectMinValue = get(state, "minScale.incorrectValue", "");
    const correctMinValue = get(props, `properties.controls.${basePath}.min`, "");

    const incorrectMinInvalid = isValueMinusOrEmpty(incorrectMinValue);
    const minNumberValue = incorrectMinInvalid
        ? fixEmptyMinValue(correctMinValue)
        : Number(incorrectMinValue);
    const maxNumberValue = fixEmptyMaxValue(maxValue);
    const maxIsMinus = maxValue === "-";

    const { propertiesMeta, pushData } = props;
    set(propertiesMeta, "undoApplied", false);

    // dash, non-numeric or min/max mismatch: set error
    if (isInvalidOrMinMaxError(maxValue, minNumberValue, maxNumberValue)) {
        setState({
            minScale: {
                ...state.minScale,
                hasWarning: incorrectMinValue === "-",
            },
            maxScale: {
                hasWarning: true,
                // no error message for dash
                warningMessage: maxIsMinus ? "" : getTranslation("properties.axis.max.warning", props.intl),
                incorrectValue: maxValue,
            },
        });

        pushData({ propertiesMeta }); // post undoApplied flag to AD
        return;
    }

    // valid, set new value
    const { properties } = props;
    set(properties, `controls.${basePath}.max`, maxValue);

    // if incorrect value was set previously but now validation passed, set incorrect value as correct value
    if (isNaN(parseFloat(incorrectMinValue))) {
        setState({
            maxScale: defaultState.maxScale,
        });
    } else {
        set(properties, `controls.${basePath}.min`, incorrectMinValue);
        setState(defaultState);
    }

    pushData({ properties, propertiesMeta });
}

export function minInputValidateAndPushData(
    data: any,
    state: IMinMaxControlState,
    props: IMinMaxControlProps & WrappedComponentProps,
    setState: any,
    defaultState: IMinMaxControlState,
) {
    const { basePath } = props;
    const minValue = get(data, `properties.controls.${basePath}.min`);
    const incorrectMaxValue = get(state, "maxScale.incorrectValue", "");
    const correctMaxValue = get(props, `properties.controls.${basePath}.max`, "");

    const incorrectMaxInvalid = isValueMinusOrEmpty(incorrectMaxValue);
    const maxNumberValue = incorrectMaxInvalid
        ? fixEmptyMaxValue(correctMaxValue)
        : Number(incorrectMaxValue);
    const minNumberValue = fixEmptyMinValue(minValue);
    const minIsDash = minValue === "-";

    const { propertiesMeta, pushData } = props;
    set(propertiesMeta, "undoApplied", false);

    // dash, non-numeric or min/max mismatch: set error
    if (isInvalidOrMinMaxError(minValue, minNumberValue, maxNumberValue)) {
        setState({
            maxScale: {
                ...state.maxScale,
                hasWarning: incorrectMaxValue === "-",
            },
            minScale: {
                hasWarning: true,
                // no error message for dash
                warningMessage: minIsDash ? "" : getTranslation("properties.axis.min.warning", props.intl),
                incorrectValue: minValue,
            },
        });

        pushData({ propertiesMeta }); // post undoApplied flag to AD
        return;
    }

    // valid, set new value
    const { properties } = props;

    set(properties, `controls.${basePath}.min`, minValue);

    // if incorrect value was set previously but now validation passed, set incorrect value as correct value
    if (isNaN(parseFloat(incorrectMaxValue))) {
        setState({
            minScale: defaultState.minScale,
        });
    } else {
        set(properties, `controls.${basePath}.max`, incorrectMaxValue);
        setState(defaultState);
    }

    pushData({ properties, propertiesMeta });
}
