// (C) 2019-2025 GoodData Corporation

import { type ReactElement } from "react";

import { type ISeparators } from "@gooddata/sdk-ui";
import { InputWithNumberFormat } from "@gooddata/sdk-ui-kit";

interface IRangeInputProps {
    from?: number | null;
    to?: number | null;
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
        <div className={"gd-mvf-range-input"} data-testid="mvf-range-input">
            <InputWithNumberFormat
                className="s-mvf-range-from-input"
                dataTestId="mvf-range-from-input"
                value={from!}
                onChange={(val) => onFromChange(val as number)}
                onEnterKeyPress={onEnterKeyPress}
                isSmall
                autofocus={!disableAutofocus}
                suffix={usePercentage ? "%" : ""}
                separators={separators}
            />
            <InputWithNumberFormat
                className="s-mvf-range-to-input"
                dataTestId="mvf-range-to-input"
                value={to!}
                onChange={(val) => onToChange(val as number)}
                onEnterKeyPress={onEnterKeyPress}
                isSmall
                suffix={usePercentage ? "%" : ""}
                separators={separators}
            />
        </div>
    );
}
