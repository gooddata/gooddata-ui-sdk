// (C) 2007-2022 GoodData Corporation
import React from "react";
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
    separators: Separators;
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

export class InputWithNumberFormat extends React.PureComponent<
    InputWithNumberFormatProps,
    InputWithNumberFormatState
> {
    private input: InputPure;

    static defaultProps = {
        ...InputPure.defaultProps,
        separators: DEFAULT_SEPARATORS,
    };

    constructor(props: InputWithNumberFormatProps) {
        super(props);

        this.state = {
            value: format(props.value, props.separators),
            isFocused: false,
        };
    }

    UNSAFE_componentWillReceiveProps({ value: newValue }: InputWithNumberFormatProps): void {
        const { value, separators } = this.props;
        const { isFocused } = this.state;

        if (value !== newValue && !isFocused) {
            this.setState({ value: format(newValue, separators) });
        }
    }

    onChange = (value: number, e: React.ChangeEvent<HTMLInputElement>): void => {
        const { separators, onChange } = this.props;

        if (this.state.value === value) {
            return;
        }

        if (!isValid(value, separators)) {
            this.handleCaretShift(e);
            return;
        }

        this.setState({ value });
        onChange(parse(value, separators));
    };

    onFocus = (e: React.FocusEvent<HTMLInputElement>): void => {
        this.setState({ isFocused: true });
        this.props.onFocus(e);
    };

    onBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
        const { separators, onBlur } = this.props;
        const { value } = this.state;

        this.setState({
            value: format(parse(value, separators), separators),
            isFocused: false,
        });
        onBlur(e);
    };

    handleCaretShift(e: React.ChangeEvent<HTMLInputElement>): void {
        const caretPosition = e.target.selectionStart - 1;

        this.setState({}, () => {
            this.input.inputNodeRef.setSelectionRange(caretPosition, caretPosition);
        });
    }

    render() {
        return (
            <InputPure
                {...this.props}
                ref={(ref) => {
                    this.input = ref;
                }}
                onFocus={this.onFocus}
                onChange={this.onChange}
                onBlur={this.onBlur}
                value={this.state.value}
            />
        );
    }
}
