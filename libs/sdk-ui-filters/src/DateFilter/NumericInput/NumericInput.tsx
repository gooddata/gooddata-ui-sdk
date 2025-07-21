// (C) 2007-2025 GoodData Corporation
import { ChangeEvent, KeyboardEvent, useCallback } from "react";
import isNumber from "lodash/isNumber.js";
import defaultTo from "lodash/defaultTo.js";
import clamp from "lodash/clamp.js";

import { ArrowButton } from "./ArrowButton.js";
import { unless } from "./utils.js";

type NumericInputValue = number | "" | "-";

const isIntermediateValue = (value: number | string): value is "" | "-" => value === "" || value === "-";

const isNumericOrEmptyString = (value: unknown): value is number | "" => value === "" || isNumber(value);

const UP_ARROW_CODE = 38;
const DOWN_ARROW_CODE = 40;

export function NumericInput({
    value,
    onChange,
    placeholder,
    min,
    max,
}: {
    value: NumericInputValue;
    onChange: (value: NumericInputValue) => void;
    placeholder?: string;
    min?: number;
    max?: number;
}) {
    const isIncrementDisabled = () =>
        !isNumericOrEmptyString(value) || (max !== undefined && isNumber(value) && value >= max);

    const isDecrementDisabled = () =>
        !isNumericOrEmptyString(value) || (min !== undefined && isNumber(value) && value <= min);

    const clampToRange = useCallback(
        (val: number) => {
            const upper = defaultTo(max, Infinity);
            const lower = defaultTo(min, -Infinity);
            return clamp(val, lower, upper);
        },
        [min, max],
    );

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        if (isIntermediateValue(inputValue)) {
            onChange(inputValue);
        }
        const parsed = Number.parseInt(inputValue, 10);
        if (Number.isInteger(parsed)) {
            onChange(parsed);
        }
    };

    const valueChanger = (delta: number) => () => {
        const newValue = isIntermediateValue(value) ? delta : clampToRange(value + delta);
        onChange(newValue);
    };

    const increment = valueChanger(1);
    const decrement = valueChanger(-1);

    const keyDownHandlers: Record<string, () => void> = {
        [UP_ARROW_CODE]: () => unless(isIncrementDisabled, increment),
        [DOWN_ARROW_CODE]: () => unless(isDecrementDisabled, decrement),
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        const handler = keyDownHandlers[e.keyCode];
        if (handler) {
            handler();
        }
    };

    return (
        <label className="gd-input gd-input-with-suffix gd-numeric-input">
            <input
                type="text"
                className="gd-input-field"
                value={value}
                placeholder={placeholder}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
            />
            <ArrowButton arrowDirection="increment" disabled={isIncrementDisabled()} onClick={increment} />
            <ArrowButton arrowDirection="decrement" disabled={isDecrementDisabled()} onClick={decrement} />
        </label>
    );
}
