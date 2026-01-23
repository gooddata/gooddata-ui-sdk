// (C) 2019-2026 GoodData Corporation

import { type ReactElement } from "react";

import { useIntl } from "react-intl";

import { type ISeparators } from "@gooddata/sdk-ui";
import { InputWithNumberFormat } from "@gooddata/sdk-ui-kit";

interface IComparisonInputProps {
    value?: number | null;
    usePercentage: boolean;
    disableAutofocus?: boolean;
    onValueChange: (value: number) => void;
    onEnterKeyPress?: () => void;
    onBlur?: () => void;
    hasError?: boolean;
    ariaDescribedBy?: string;
    separators?: ISeparators;
}

export function ComparisonInput({
    value,
    usePercentage,
    disableAutofocus,
    onValueChange,
    onEnterKeyPress,
    onBlur,
    hasError,
    ariaDescribedBy,
    separators,
}: IComparisonInputProps): ReactElement {
    const intl = useIntl();

    return (
        <InputWithNumberFormat
            className="s-mvf-comparison-value-input"
            dataTestId="mvf-comparison-value-input"
            value={value ?? undefined}
            onEnterKeyPress={onEnterKeyPress}
            onChange={(val) => onValueChange(val as number)}
            onBlur={onBlur ? () => onBlur() : undefined}
            hasError={hasError}
            isSmall
            autofocus={!disableAutofocus}
            suffix={usePercentage ? "%" : ""}
            accessibilityConfig={{
                suffixAriaLabel: usePercentage
                    ? intl.formatMessage({
                          id: "input.unit.percent",
                      })
                    : undefined,
                ariaDescribedBy,
                ariaInvalid: hasError ? true : undefined,
            }}
            separators={separators}
        />
    );
}
