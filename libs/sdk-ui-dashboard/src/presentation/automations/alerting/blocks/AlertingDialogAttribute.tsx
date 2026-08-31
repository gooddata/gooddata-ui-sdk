// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { FormattedMessage } from "react-intl";

import { AutomationDialogFormField } from "../../shared/slots/AutomationDialogFormField.js";
import { DefaultAlertingDialogAttribute } from "../DefaultAlertingDialog/DefaultAlertingDialogAttribute.js";
import { useAlertingDialogAttributeProps } from "../state/useAlertingDialogFieldProps.js";
import { type IAlertingDialogAttributeProps } from "../types.js";

import { WhenAlertingDialogLoaded } from "./WhenAlertingDialogLoaded.js";

/**
 * The alerting dialog's attribute field ("For": the attribute value the condition is sliced by),
 * connected to the dialog's state and rendered as a labelled form row.
 *
 * Renders {@link DefaultAlertingDialogAttribute} inside {@link AutomationDialogFormField} with the
 * props of {@link useAlertingDialogAttributeProps}; every prop passed here replaces the hook's
 * value for that prop wholesale. Renders nothing when the insight has no non-date attribute (there
 * is nothing to slice by; the gate reads the `attributes` prop, so an override is honoured), and
 * nothing while `useAlertingDialogContext().isLoading` is true.
 *
 * @alpha
 */
export function AlertingDialogAttribute(overrides: Partial<IAlertingDialogAttributeProps>): ReactElement {
    return (
        <WhenAlertingDialogLoaded>
            <ConnectedAlertingDialogAttribute {...overrides} />
        </WhenAlertingDialogLoaded>
    );
}

function ConnectedAlertingDialogAttribute(overrides: Partial<IAlertingDialogAttributeProps>) {
    const props = { ...useAlertingDialogAttributeProps(), ...overrides };
    if (!props.attributes.some((attribute) => attribute.type === "attribute")) {
        return null;
    }
    return (
        <AutomationDialogFormField
            label={<FormattedMessage id="insightAlert.config.for" />}
            htmlFor={props.id}
        >
            <DefaultAlertingDialogAttribute {...props} />
        </AutomationDialogFormField>
    );
}
