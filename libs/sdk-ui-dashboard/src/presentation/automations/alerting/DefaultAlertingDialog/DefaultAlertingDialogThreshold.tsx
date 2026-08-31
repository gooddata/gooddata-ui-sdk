// (C) 2019-2026 GoodData Corporation

import { type ReactElement } from "react";

import { useIntl } from "react-intl";

import { Input } from "@gooddata/sdk-ui-kit";

import { type IAlertingDialogThresholdProps } from "../types.js";

/**
 * Default render of the alerting dialog's threshold field: the numeric input for the threshold,
 * with its unit suffix and validation message. Props-driven — the bare control without its label;
 * reads no dialog context (only `useIntl`). The default dialog and {@link AlertingDialogThreshold}
 * render it with {@link useAlertingDialogThresholdProps} inside {@link AutomationDialogFormField}.
 *
 * @alpha
 */
export function DefaultAlertingDialogThreshold({
    id,
    value,
    onChange,
    onBlur,
    suffix,
    errorMessage,
}: IAlertingDialogThresholdProps): ReactElement {
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
