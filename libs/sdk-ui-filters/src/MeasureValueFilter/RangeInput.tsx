// (C) 2019 GoodData Corporation
import { InputWithNumberFormat } from "@gooddata/sdk-ui-kit";
import { ISeparators } from "@gooddata/sdk-ui";
import React from "react";

interface IRangeInputProps {
    from: number;
    to: number;
    usePercentage: boolean;
    disableAutofocus?: boolean;
    onFromChange: (value: number) => void;
    onToChange: (value: number) => void;
    onEnterKeyPress?: () => void;
    separators?: ISeparators;
}

const RangeInput = ({
    from,
    to,
    usePercentage,
    disableAutofocus,
    onFromChange,
    onToChange,
    onEnterKeyPress,
    separators,
}: IRangeInputProps): JSX.Element => {
    return (
        <div className={"gd-mvf-range-input"}>
            <InputWithNumberFormat
                className="s-mvf-range-from-input"
                value={from}
                onChange={onFromChange}
                onEnterKeyPress={onEnterKeyPress}
                isSmall={true}
                autofocus={!disableAutofocus}
                suffix={usePercentage ? "%" : ""}
                separators={separators}
            />
            <InputWithNumberFormat
                className="s-mvf-range-to-input"
                value={to}
                onChange={onToChange}
                onEnterKeyPress={onEnterKeyPress}
                isSmall={true}
                suffix={usePercentage ? "%" : ""}
                separators={separators}
            />
        </div>
    );
};

export default RangeInput;
