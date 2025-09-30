// (C) 2019-2025 GoodData Corporation

import { FocusEvent } from "react";

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
    const hasError = !!errorMessage;

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
                aria-describedby={hasError ? "gd-threshold-field-error" : undefined}
                aria-invalid={hasError}
            />
            {errorMessage ? (
                <div id="gd-threshold-field-error" className="gd-threshold-field-error">
                    {errorMessage}
                </div>
            ) : null}
        </div>
    );
}
