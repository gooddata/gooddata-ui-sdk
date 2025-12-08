// (C) 2019-2025 GoodData Corporation

import { ReactElement } from "react";

import { ISeparators } from "@gooddata/sdk-ui";
import { InputWithNumberFormat } from "@gooddata/sdk-ui-kit";

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

export function RangeInput({
    from,
    to,
    usePercentage,
    disableAutofocus,
    onFromChange,
    onToChange,
    onEnterKeyPress,
    separators,
}: IRangeInputProps): ReactElement {
    return (
        <div className={"gd-mvf-range-input"}>
            <InputWithNumberFormat
                className="s-mvf-range-from-input"
                value={from}
                onChange={onFromChange}
                onEnterKeyPress={onEnterKeyPress}
                isSmall
                autofocus={!disableAutofocus}
                suffix={usePercentage ? "%" : ""}
                separators={separators}
            />
            <InputWithNumberFormat
                className="s-mvf-range-to-input"
                value={to}
                onChange={onToChange}
                onEnterKeyPress={onEnterKeyPress}
                isSmall
                suffix={usePercentage ? "%" : ""}
                separators={separators}
            />
        </div>
    );
}
