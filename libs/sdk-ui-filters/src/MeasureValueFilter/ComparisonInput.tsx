// (C) 2019-2025 GoodData Corporation
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

export default function ComparisonInput({
    value,
    usePercentage,
    disableAutofocus,
    onValueChange,
    onEnterKeyPress,
    separators,
}: IComparisonInputProps) {
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
