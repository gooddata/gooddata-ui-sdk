// (C) 2020-2026 GoodData Corporation

import { type ChangeEvent, forwardRef, useLayoutEffect, useRef, useState } from "react";

import {
    type IInputPureHandle,
    type IInputPureProps,
    InputPure,
    inputPureDefaultProps,
} from "./InputPure.js";

const isValidNumber = (value: string | number) => typeof value === "number" && !Number.isNaN(value);
const isNumberOrString = (value: string | number) =>
    isValidNumber(value) || (typeof value === "string" && value.length);
const toValidValue = (value: string | number) => (isNumberOrString(value) ? value : "");

/**
 * @internal
 */
export interface IInputState {
    value: string | number;
}

/**
 * @internal
 */
export const Input = forwardRef<IInputPureHandle, IInputPureProps>(function Input(props, ref) {
    const { value: propValue = inputPureDefaultProps.value, onChange } = props;

    const [value, setValue] = useState(() => toValidValue(propValue));

    const lastPropValueRef = useRef(propValue);

    // Keeps the derived state in sync with the value prop and notifies the consumer about the
    // normalization, the same way the former UNSAFE_componentWillReceiveProps did. A layout effect
    // is what keeps the parity: the class synced the state before rendering, so a changed value
    // prop was part of the very same commit. Here the re-render is flushed before the browser
    // paints instead, so the stale value can never be shown.
    useLayoutEffect(() => {
        // Object.is, not ===, so that a NaN value prop counts as unchanged; === would make every
        // re-render look like a new external update and reset the value the user just typed.
        if (Object.is(lastPropValueRef.current, propValue)) {
            return;
        }
        lastPropValueRef.current = propValue;

        const validValue = toValidValue(propValue);
        if (value !== validValue) {
            setValue(validValue);
            onChange?.(validValue);
        }
    }, [propValue, value, onChange]);

    const handleChange = (newValue: string | number, e?: ChangeEvent<HTMLInputElement>): void => {
        if (value !== newValue) {
            setValue(newValue);
            onChange?.(newValue, e);
        }
    };

    return <InputPure {...props} ref={ref} onChange={handleChange} value={value} />;
});
