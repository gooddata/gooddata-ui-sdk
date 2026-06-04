// (C) 2019-2026 GoodData Corporation

import { type ReactElement } from "react";

import { useIntl } from "react-intl";

import { type ISeparators } from "@gooddata/sdk-ui";
import { InputWithNumberFormat, useId } from "@gooddata/sdk-ui-kit";

interface IRangeInputFieldProps {
    errorText?: string;
}

interface IRangeInputProps {
    from?: number | null;
    to?: number | null;
    usePercentage: boolean;
    disableAutofocus?: boolean;
    onFromChange: (value: number) => void;
    onToChange: (value: number) => void;
    onEnterKeyPress?: () => void;
    onFromBlur?: () => void;
    onToBlur?: () => void;
    fromField?: IRangeInputFieldProps;
    toField?: IRangeInputFieldProps;
    separators?: ISeparators;
    /**
     * 1-based condition position. When set, it is appended to the from/to accessible labels so a
     * filter with multiple conditions does not expose several identically-named inputs
     * (WCAG 2.4.6) — a unique id alone is not enough, the checker compares the resolved name text.
     */
    conditionNumber?: number;
}

export function RangeInput({
    from,
    to,
    usePercentage,
    disableAutofocus,
    onFromChange,
    onToChange,
    onEnterKeyPress,
    onFromBlur,
    onToBlur,
    fromField,
    toField,
    separators,
    conditionNumber,
}: IRangeInputProps): ReactElement {
    const intl = useIntl();
    const baseId = useId();
    const fromErrorId = `${baseId}-mvf-range-from-error`;
    const toErrorId = `${baseId}-mvf-range-to-error`;
    // Labels are provided via hidden elements referenced by aria-labelledby, following the
    // codebase convention for input labelling.
    const fromLabelId = `${baseId}-mvf-range-from-label`;
    const toLabelId = `${baseId}-mvf-range-to-label`;
    const fromHasError = !!fromField?.errorText;
    const toHasError = !!toField?.errorText;

    const withCondition = (label: string) =>
        conditionNumber === undefined
            ? label
            : intl.formatMessage(
                  { id: "mvf.input.ariaLabel.withCondition" },
                  { label, number: conditionNumber },
              );
    const fromLabelText = withCondition(intl.formatMessage({ id: "mvf.rangeInput.from.ariaLabel" }));
    const toLabelText = withCondition(intl.formatMessage({ id: "mvf.rangeInput.to.ariaLabel" }));

    return (
        <div className={"gd-mvf-range-input"} data-testid="mvf-range-input">
            <div className="gd-mvf-range-input__field gd-mvf-range-input__field--from">
                <InputWithNumberFormat
                    className="s-mvf-range-from-input"
                    dataTestId="mvf-range-from-input"
                    autocomplete="off"
                    value={from!}
                    onChange={(val) => onFromChange(val as number)}
                    onEnterKeyPress={onEnterKeyPress}
                    onBlur={onFromBlur ? () => onFromBlur() : undefined}
                    hasError={fromHasError}
                    isSmall
                    autofocus={!disableAutofocus}
                    suffix={usePercentage ? "%" : ""}
                    accessibilityConfig={{
                        ariaLabelledBy: fromLabelId,
                        suffixAriaLabel: usePercentage
                            ? intl.formatMessage({
                                  id: "input.unit.percent",
                              })
                            : undefined,
                        ariaDescribedBy: fromHasError ? fromErrorId : undefined,
                        ariaInvalid: fromHasError ? true : undefined,
                    }}
                    separators={separators}
                />
                <span className="sr-only" id={fromLabelId}>
                    {fromLabelText}
                </span>
                {fromField?.errorText ? (
                    <div
                        id={fromErrorId}
                        className="gd-mvf-input-error gd-mvf-input-error--range s-mvf-input-error"
                        role="alert"
                    >
                        {fromField?.errorText}
                    </div>
                ) : null}
            </div>
            <div className="gd-mvf-range-input__field gd-mvf-range-input__field--to">
                <InputWithNumberFormat
                    className="s-mvf-range-to-input"
                    dataTestId="mvf-range-to-input"
                    autocomplete="off"
                    value={to!}
                    onChange={(val) => onToChange(val as number)}
                    onEnterKeyPress={onEnterKeyPress}
                    onBlur={onToBlur ? () => onToBlur() : undefined}
                    isSmall
                    suffix={usePercentage ? "%" : ""}
                    hasError={toHasError}
                    accessibilityConfig={{
                        ariaLabelledBy: toLabelId,
                        suffixAriaLabel: usePercentage
                            ? intl.formatMessage({
                                  id: "input.unit.percent",
                              })
                            : undefined,
                        ariaDescribedBy: toHasError ? toErrorId : undefined,
                        ariaInvalid: toHasError ? true : undefined,
                    }}
                    separators={separators}
                />
                <span className="sr-only" id={toLabelId}>
                    {toLabelText}
                </span>
                {toField?.errorText ? (
                    <div
                        id={toErrorId}
                        className="gd-mvf-input-error gd-mvf-input-error--range s-mvf-input-error"
                        role="alert"
                    >
                        {toField?.errorText}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
