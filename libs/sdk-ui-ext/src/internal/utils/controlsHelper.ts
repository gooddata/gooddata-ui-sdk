// (C) 2019-2023 GoodData Corporation
import set from "lodash/set.js";
import { WrappedComponentProps } from "react-intl";
import { getTranslation } from "./translations.js";
import { IMinMaxControlState, IMinMaxControlProps } from "../interfaces/MinMaxControl.js";
import { IPushData } from "@gooddata/sdk-ui";
import { messages } from "../../locales.js";

function fixEmptyMaxValue(value: string): number {
    return value === "" ? Number.MAX_SAFE_INTEGER : Number(value);
}

function fixEmptyMinValue(value: string): number {
    return value === "" ? Number.MIN_SAFE_INTEGER : Number(value);
}

function isValueMinusOrEmpty(value: string): boolean {
    return value === "-" || value === "";
}

function isInvalidOrMinMaxError(value: string, minNumberValue: number, maxNumberValue: number): boolean {
    const valueIsMinus = value === "-";
    const maxMinNumbers = !isNaN(minNumberValue) && !isNaN(maxNumberValue);
    return valueIsMinus || !maxMinNumbers || minNumberValue > maxNumberValue;
}

export function maxInputValidateAndPushData(
    data: IPushData,
    state: IMinMaxControlState,
    props: IMinMaxControlProps & WrappedComponentProps,
    setState: (data: Partial<IMinMaxControlState>) => void,
    defaultState: IMinMaxControlState,
): void {
    const { basePath } = props;
    const maxValue = data?.properties?.controls?.[basePath]?.max;
    const incorrectMinValue = state?.minScale?.incorrectValue ?? "";
    const correctMinValue = props?.properties?.controls?.[basePath]?.min ?? "";

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
                warningMessage: maxIsMinus ? "" : getTranslation(messages.axisMaxWarning.id, props.intl),
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
    data: IPushData,
    state: IMinMaxControlState,
    props: IMinMaxControlProps & WrappedComponentProps,
    setState: (data: Partial<IMinMaxControlState>) => void,
    defaultState: IMinMaxControlState,
): void {
    const { basePath } = props;
    const minValue = data?.properties?.controls?.[basePath]?.min;
    const incorrectMaxValue = state?.maxScale?.incorrectValue ?? "";
    const correctMaxValue = props?.properties?.controls?.[basePath]?.max ?? "";

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
                warningMessage: minIsDash ? "" : getTranslation(messages.axisMinWarning.id, props.intl),
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
