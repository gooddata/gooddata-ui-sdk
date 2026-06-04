// (C) 2019-2026 GoodData Corporation

import { type ReactElement } from "react";

import { useIntl } from "react-intl";

import { type ISeparators } from "@gooddata/sdk-ui";
import { InputWithNumberFormat, useIdPrefixed } from "@gooddata/sdk-ui-kit";

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
    /**
     * 1-based condition position. When set, it is appended to the accessible label so a filter
     * with multiple conditions does not expose several identically-named inputs (WCAG 2.4.6) —
     * a unique id alone is not enough, the checker compares the resolved name text.
     */
    conditionNumber?: number;
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
    conditionNumber,
}: IComparisonInputProps): ReactElement {
    const intl = useIntl();
    // Label is provided via a hidden element referenced by aria-labelledby (rather than a direct
    // aria-label string), following the codebase convention for input labelling.
    const labelId = useIdPrefixed("mvf-comparison-value-label");
    const baseLabel = intl.formatMessage({ id: "mvf.comparisonInput.ariaLabel" });
    const labelText =
        conditionNumber === undefined
            ? baseLabel
            : intl.formatMessage(
                  { id: "mvf.input.ariaLabel.withCondition" },
                  { label: baseLabel, number: conditionNumber },
              );

    return (
        <>
            <InputWithNumberFormat
                className="s-mvf-comparison-value-input"
                dataTestId="mvf-comparison-value-input"
                autocomplete="off"
                value={value ?? undefined}
                onEnterKeyPress={onEnterKeyPress}
                onChange={(val) => onValueChange(val as number)}
                onBlur={onBlur ? () => onBlur() : undefined}
                hasError={hasError}
                isSmall
                autofocus={!disableAutofocus}
                suffix={usePercentage ? "%" : ""}
                accessibilityConfig={{
                    ariaLabelledBy: labelId,
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
            <span className="sr-only" id={labelId}>
                {labelText}
            </span>
        </>
    );
}
