// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { FormattedMessage } from "react-intl";

import { AutomationDialogFormField } from "../../shared/slots/AutomationDialogFormField.js";
import { DefaultAlertingDialogTriggerMode } from "../DefaultAlertingDialog/DefaultAlertingDialogTriggerMode.js";
import { useAlertingDialogTriggerModeProps } from "../state/useAlertingDialogFieldProps.js";
import { type IAlertingDialogTriggerModeProps } from "../types.js";

import { WhenAlertingDialogLoaded } from "./WhenAlertingDialogLoaded.js";

/**
 * The alerting dialog's trigger-mode field ("Trigger": how often a met condition notifies),
 * connected to the dialog's state and rendered as a labelled form row.
 *
 * Renders {@link DefaultAlertingDialogTriggerMode} inside {@link AutomationDialogFormField} with
 * the props of {@link useAlertingDialogTriggerModeProps}; every prop passed here replaces the
 * hook's value for that prop wholesale. Renders nothing while
 * `useAlertingDialogContext().isLoading` is true.
 *
 * @alpha
 */
export function AlertingDialogTriggerMode(overrides: Partial<IAlertingDialogTriggerModeProps>): ReactElement {
    return (
        <WhenAlertingDialogLoaded>
            <ConnectedAlertingDialogTriggerMode {...overrides} />
        </WhenAlertingDialogLoaded>
    );
}

function ConnectedAlertingDialogTriggerMode(overrides: Partial<IAlertingDialogTriggerModeProps>) {
    const props = { ...useAlertingDialogTriggerModeProps(), ...overrides };
    return (
        <AutomationDialogFormField
            label={<FormattedMessage id="insightAlert.config.trigger" />}
            htmlFor={props.id}
        >
            <DefaultAlertingDialogTriggerMode {...props} />
        </AutomationDialogFormField>
    );
}
