// (C) 2019-2025 GoodData Corporation
import React, { ReactElement } from "react";

import { ISeparators } from "@gooddata/sdk-ui";
import { InputWithNumberFormat } from "@gooddata/sdk-ui-kit";

interface IComparisonInputProps {
    value: number;
    usePercentage: boolean;
    disableAutofocus?: boolean;
    onValueChange: (value: number) => void;
    onEnterKeyPress?: () => void;
    separators?: ISeparators;
}

function ComparisonInput({
    value,
    usePercentage,
    disableAutofocus,
    onValueChange,
    onEnterKeyPress,
    separators,
}: IComparisonInputProps): ReactElement {
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
}

export default ComparisonInput;
