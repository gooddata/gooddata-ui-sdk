// (C) 2019-2026 GoodData Corporation

import { type FocusEvent } from "react";

import { useIntl } from "react-intl";

import { Input } from "@gooddata/sdk-ui-kit";

interface IAlertThresholdInputProps {
    id: string;
    value: number | undefined;
    onChange: (value: string | number) => void;
    onBlur: (event: FocusEvent<HTMLInputElement>) => void;
    suffix?: string;
    errorMessage?: string;
}

export function AlertThresholdInput({
    id,
    value,
    onChange,
    onBlur,
    suffix,
    errorMessage,
}: IAlertThresholdInputProps) {
    const intl = useIntl();
    const hasError = !!errorMessage;
    const errorId = `${id}-error`;

    return (
        <div>
            <Input
                id={id}
                className="gd-edit-alert__value-input s-alert-value-input"
                isSmall
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                type="number"
                suffix={suffix}
                hasError={hasError}
                accessibilityConfig={{
                    ariaDescribedBy: hasError ? errorId : undefined,
                    ariaInvalid: hasError,
                    suffixAriaLabel:
                        suffix === "%"
                            ? intl.formatMessage({
                                  id: "input.unit.percent",
                              })
                            : suffix,
                }}
            />
            {errorMessage ? (
                <div id={errorId} className="gd-threshold-field-error">
                    {errorMessage}
                </div>
            ) : null}
        </div>
    );
}
