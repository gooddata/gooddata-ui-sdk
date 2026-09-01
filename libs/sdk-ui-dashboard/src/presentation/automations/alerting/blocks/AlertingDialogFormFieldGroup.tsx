// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { type IAlertingDialogFormFieldGroupProps } from "../types.js";

/**
 * A heading with a column of field rows under it — the default alerting dialog's "When" (the condition
 * fields) and "Do" (the action fields) groups. Layout only; reads no dialog context.
 *
 * @alpha
 */
export function AlertingDialogFormFieldGroup({
    label,
    children,
}: IAlertingDialogFormFieldGroupProps): ReactElement {
    return (
        <div className="gd-input-component gd-input-component--no-last-child-margin gd-dashboard-alerting-dialog-form-field-group">
            <div className="gd-dashboard-alerting-dialog-form-field-group__label-container">
                <label className="gd-label gd-dashboard-alerting-dialog-form-field-group__label">
                    {label}
                </label>
            </div>
            <div className="gd-dashboard-alerting-dialog-form-field-group__content-container">{children}</div>
        </div>
    );
}
