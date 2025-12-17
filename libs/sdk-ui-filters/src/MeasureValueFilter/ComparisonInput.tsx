// (C) 2019-2025 GoodData Corporation

import { type ReactElement } from "react";

import { type ISeparators } from "@gooddata/sdk-ui";
import { InputWithNumberFormat } from "@gooddata/sdk-ui-kit";

interface IComparisonInputProps {
    value?: number | null;
    usePercentage: boolean;
    disableAutofocus?: boolean;
    onValueChange: (value: number) => void;
    onEnterKeyPress?: () => void;
    separators?: ISeparators;
}

export function ComparisonInput({
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
            dataTestId="mvf-comparison-value-input"
            value={value ?? undefined}
            onEnterKeyPress={onEnterKeyPress}
            onChange={(val) => onValueChange(val as number)}
            isSmall
            autofocus={!disableAutofocus}
            suffix={usePercentage ? "%" : ""}
            separators={separators}
        />
    );
}
