// (C) 2007-2025 GoodData Corporation

import { ChangeEvent, KeyboardEvent, useCallback, useMemo } from "react";

import clamp from "lodash/clamp.js";
import defaultTo from "lodash/defaultTo.js";
import isNumber from "lodash/isNumber.js";

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
    const isIncrementDisabled = useCallback(
        () => !isNumericOrEmptyString(value) || (max !== undefined && isNumber(value) && value >= max),
        [value, max],
    );

    const isDecrementDisabled = useCallback(
        () => !isNumericOrEmptyString(value) || (min !== undefined && isNumber(value) && value <= min),
        [value, min],
    );

    const clampToRange = useCallback(
        (val: number): number => {
            const upperBound = defaultTo(max, Infinity);
            const lowerBound = defaultTo(min, -Infinity);
            return clamp(val, lowerBound, upperBound);
        },
        [max, min],
    );

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            if (isIntermediateValue(e.target.value)) {
                onChange(e.target.value);
            }
            const parsedValue = Number.parseInt(e.target.value, 10);
            if (Number.isInteger(parsedValue)) {
                onChange(parsedValue);
            }
        },
        [onChange],
    );

    const valueChanger = useCallback(
        (delta: number) => () => onChange(isIntermediateValue(value) ? delta : clampToRange(value + delta)),
        [value, onChange, clampToRange],
    );

    const increment = useCallback(() => valueChanger(1)(), [valueChanger]);

    const decrement = useCallback(() => valueChanger(-1)(), [valueChanger]);

    const keyDownHandlers: Record<string, () => void> = useMemo(
        () => ({
            [UP_ARROW_CODE]: () => unless(isIncrementDisabled, increment),
            [DOWN_ARROW_CODE]: () => unless(isDecrementDisabled, decrement),
        }),
        [isIncrementDisabled, increment, isDecrementDisabled, decrement],
    );

    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            const handler = keyDownHandlers[e.keyCode];
            if (handler) {
                handler();
            }
        },
        [keyDownHandlers],
    );

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
