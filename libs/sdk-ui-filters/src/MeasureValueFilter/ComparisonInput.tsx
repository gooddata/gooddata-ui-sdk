// (C) 2019 GoodData Corporation
import React from "react";
import { InputWithNumberFormat } from "@gooddata/sdk-ui-kit";
import { ISeparators } from "@gooddata/sdk-ui";

interface IComparisonInputProps {
    value: number;
    usePercentage: boolean;
    disableAutofocus?: boolean;
    onValueChange: (value: number) => void;
    onEnterKeyPress?: () => void;
    separators?: ISeparators;
}

const ComparisonInput = ({
    value,
    usePercentage,
    disableAutofocus,
    onValueChange,
    onEnterKeyPress,
    separators,
}: IComparisonInputProps): JSX.Element => {
    return (
        <InputWithNumberFormat
            className="s-mvf-comparison-value-input"
            value={value}
            onEnterKeyPress={onEnterKeyPress}
            onChange={onValueChange}
            isSmall={true}
            autofocus={!disableAutofocus}
            suffix={usePercentage ? "%" : ""}
            separators={separators}
        />
    );
};

export default ComparisonInput;
