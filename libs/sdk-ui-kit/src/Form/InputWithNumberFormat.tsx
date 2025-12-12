// (C) 2007-2025 GoodData Corporation

import { type ChangeEvent, type FocusEvent, memo, useEffect, useRef, useState } from "react";

import { memoize } from "lodash-es";

import { InputPure, type InputPureProps } from "./InputPure.js";
import { type Separators } from "./typings.js";

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
    const parsed = parse(value, separators);
    return getFormatValidationRegExp(separators).test(value) && Math.abs(parsed ?? 0) <= MAX_NUMBER;
};

const format = (value: any, { thousand, decimal }: Separators) => {
    if (value === null || value === undefined) {
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

export const InputWithNumberFormat = memo(function InputWithNumberFormat({
    separators = DEFAULT_SEPARATORS,
    value: propValue,
    onChange,
    onFocus,
    onBlur,
    ...restProps
}: InputWithNumberFormatProps) {
    const inputRef = useRef<InputPure | null>(null);
    const [value, setValue] = useState(() => format(propValue, separators));
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (!isFocused) {
            setValue(format(propValue, separators));
        }
    }, [propValue, isFocused, separators]);

    const handleCaretShift = (e: ChangeEvent<HTMLInputElement>) => {
        const caretPosition = (e.target.selectionStart ?? 1) - 1;

        // Use setTimeout to ensure the DOM has updated before setting selection
        setTimeout(() => {
            inputRef.current?.inputNodeRef?.setSelectionRange(caretPosition, caretPosition);
        }, 0);
    };

    const handleChange = (newValue: number, e: ChangeEvent<HTMLInputElement>): void => {
        if (value === newValue) {
            return;
        }

        if (!isValid(newValue, separators)) {
            handleCaretShift(e);
            return;
        }

        setValue(newValue);
        const parsedValue = parse(newValue, separators);
        onChange?.(parsedValue as number);
    };

    const handleFocus = (e: FocusEvent<HTMLInputElement>): void => {
        setIsFocused(true);
        onFocus?.(e);
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>): void => {
        setValue(format(parse(value, separators), separators));
        setIsFocused(false);
        onBlur?.(e);
    };

    return (
        <InputPure
            {...restProps}
            ref={(ref) => {
                inputRef.current = ref;
            }}
            onFocus={handleFocus}
            onChange={handleChange as InputPureProps["onChange"]}
            onBlur={handleBlur}
            value={value}
        />
    );
});
