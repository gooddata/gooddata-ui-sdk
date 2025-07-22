// (C) 2007-2025 GoodData Corporation
import React, { memo, useState, useEffect, useRef, useCallback } from "react";
import memoize from "lodash/memoize.js";
import { InputPure, InputPureProps } from "./InputPure.js";

import { Separators } from "./typings.js";

// Highest number (BIGINT) according to gooddata documentation help.gooddata.com object-datatypes
export const MAX_NUMBER = 10 ** 15;

// Max number of digits right to decimal point according to gooddata documentation help.gooddata.com object-datatypes
const MAX_DECIMAL_POINT_NUMBERS = 6;

export const DEFAULT_SEPARATORS = {
    thousand: ",",
    decimal: ".",
};

const getDanglingDecimalPointRegExp = memoize((decimal) => new RegExp(`\\${decimal}$`));

const getFormatValidationRegExp = memoize(
    ({ thousand, decimal }) => new RegExp(`^-?(\\d|\\${thousand})*(\\${decimal}\\d*)?$`),
);

const parseStandardNumberString = (numberString: string) => {
    const belowDecimal = numberString.split(".")[1];

    const roundedNumberString =
        belowDecimal && belowDecimal.length >= MAX_DECIMAL_POINT_NUMBERS
            ? parseFloat(numberString).toFixed(MAX_DECIMAL_POINT_NUMBERS)
            : numberString;

    const number = parseFloat(roundedNumberString);

    return number === 0 ? 0 : number;
};

const convertFormattedStringToStandard = (formattedString: string, { thousand, decimal }: Separators) => {
    const withoutThousandSeparators = formattedString.toString().split(thousand).join("");

    const withoutDanglingDecimalPoint = withoutThousandSeparators.replace(
        getDanglingDecimalPointRegExp(decimal),
        "",
    );

    const withStandardDecimalPoint = withoutDanglingDecimalPoint.split(decimal).join(".");

    return withStandardDecimalPoint.length > 0 ? withStandardDecimalPoint : null;
};

const parse = (value: any | string, separators: Separators) => {
    if (value === null || value === "" || value === "-") {
        return null;
    }

    const numberString = convertFormattedStringToStandard(value, separators);

    if (numberString === null) {
        return null;
    }

    return parseStandardNumberString(numberString);
};

const isValid = (value: any, separators: Separators) => {
    return (
        getFormatValidationRegExp(separators).test(value) && Math.abs(parse(value, separators)) <= MAX_NUMBER
    );
};

const format = (value: any, { thousand, decimal }: Separators) => {
    if (value === null) {
        return "";
    }

    const [aboveDecimal, belowDecimal] = value.toString().split(".");

    const aboveDecimalFormatted = aboveDecimal.replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1${thousand}`);

    return belowDecimal ? `${aboveDecimalFormatted}${decimal}${belowDecimal}` : aboveDecimalFormatted;
};
/**
 * @internal
 */
export interface InputWithNumberFormatOwnProps {
    separators?: Separators;
}

/**
 * @internal
 */

export interface InputWithNumberFormatState {
    value: number;
    isFocused: boolean;
}

/**
 * @internal
 */

export type InputWithNumberFormatProps = InputWithNumberFormatOwnProps & InputPureProps;

/**
 * @internal
 */

export const InputWithNumberFormat = memo(function InputWithNumberFormat(props: InputWithNumberFormatProps) {
    const {
        value: propValue,
        separators = DEFAULT_SEPARATORS,
        onChange,
        onFocus,
        onBlur,
        ...restProps
    } = {
        ...InputPure.defaultProps,
        ...props,
    };

    const [value, setValue] = useState(() => format(propValue, separators));
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<InputPure>(null);

    useEffect(() => {
        if (propValue !== undefined && !isFocused) {
            setValue(format(propValue, separators));
        }
    }, [propValue, separators, isFocused]);

    const handleCaretShift = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const caretPosition = e.target.selectionStart - 1;

        // Use setTimeout to ensure the state update has been processed
        setTimeout(() => {
            if (inputRef.current?.inputNodeRef) {
                inputRef.current.inputNodeRef.setSelectionRange(caretPosition, caretPosition);
            }
        }, 0);
    }, []);

    const handleChange = useCallback(
        (newValue: number, e: React.ChangeEvent<HTMLInputElement>) => {
            if (value === newValue) {
                return;
            }

            if (!isValid(newValue, separators)) {
                handleCaretShift(e);
                return;
            }

            setValue(newValue);
            onChange(parse(newValue, separators));
        },
        [value, separators, onChange, handleCaretShift],
    );

    const handleFocus = useCallback(
        (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(true);
            onFocus(e);
        },
        [onFocus],
    );

    const handleBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement>) => {
            const formattedValue = format(parse(value, separators), separators);
            setValue(formattedValue);
            setIsFocused(false);
            onBlur(e);
        },
        [value, separators, onBlur],
    );

    return (
        <InputPure
            {...restProps}
            ref={inputRef}
            onFocus={handleFocus}
            onChange={handleChange}
            onBlur={handleBlur}
            value={value}
        />
    );
});
