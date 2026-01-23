// (C) 2019-2026 GoodData Corporation

import { type ReactElement, useId } from "react";

import { useIntl } from "react-intl";

import { type ISeparators } from "@gooddata/sdk-ui";
import { InputWithNumberFormat } from "@gooddata/sdk-ui-kit";

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
}: IRangeInputProps): ReactElement {
    const intl = useIntl();
    const baseId = useId();
    const fromErrorId = `${baseId}-mvf-range-from-error`;
    const toErrorId = `${baseId}-mvf-range-to-error`;
    const fromHasError = !!fromField?.errorText;
    const toHasError = !!toField?.errorText;

    return (
        <div className={"gd-mvf-range-input"} data-testid="mvf-range-input">
            <div className="gd-mvf-range-input__field gd-mvf-range-input__field--from">
                <InputWithNumberFormat
                    className="s-mvf-range-from-input"
                    dataTestId="mvf-range-from-input"
                    value={from!}
                    onChange={(val) => onFromChange(val as number)}
                    onEnterKeyPress={onEnterKeyPress}
                    onBlur={onFromBlur ? () => onFromBlur() : undefined}
                    hasError={fromHasError}
                    isSmall
                    autofocus={!disableAutofocus}
                    suffix={usePercentage ? "%" : ""}
                    accessibilityConfig={{
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
                    value={to!}
                    onChange={(val) => onToChange(val as number)}
                    onEnterKeyPress={onEnterKeyPress}
                    onBlur={onToBlur ? () => onToBlur() : undefined}
                    isSmall
                    suffix={usePercentage ? "%" : ""}
                    hasError={toHasError}
                    accessibilityConfig={{
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
