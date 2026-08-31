// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { type IAutomationDialogFormFieldProps } from "./types.js";

/**
 * A labelled form row of the automation dialogs: the label on the left, the control on the right.
 * Props-driven — reads no context. The default alerting dialog renders every condition field
 * through it, as do the field blocks ({@link AlertingDialogMeasure} and siblings); a custom dialog
 * that wants its own label renders a field's `Default*` control inside its own
 * `AutomationDialogFormField`.
 *
 * @alpha
 */
export function AutomationDialogFormField({
    label,
    children,
    htmlFor,
    fullWidth = false,
}: IAutomationDialogFormFieldProps): ReactElement {
    return (
        <div className="gd-input-component gd-input-component--no-last-child-margin gd-dashboard-alerting-dialog-form-field">
            <div className="gd-dashboard-alerting-dialog-form-field__label-container">
                <label className="gd-label gd-dashboard-alerting-dialog-form-field__label" htmlFor={htmlFor}>
                    {label}
                </label>
            </div>
            <div
                className={
                    fullWidth
                        ? "gd-dashboard-alerting-dialog-form-field__content-container-full-width"
                        : "gd-dashboard-alerting-dialog-form-field__content-container"
                }
            >
                {children}
            </div>
        </div>
    );
}
