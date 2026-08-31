// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { FormattedMessage } from "react-intl";

import { AutomationDialogFormField } from "../../shared/slots/AutomationDialogFormField.js";
import { DefaultAlertingDialogSensitivity } from "../DefaultAlertingDialog/DefaultAlertingDialogSensitivity.js";
import { useAlertDraft } from "../state/AlertDraftContext.js";
import { useAlertingDialogSensitivityProps } from "../state/useAlertingDialogFieldProps.js";
import { type IAlertingDialogSensitivityProps } from "../types.js";
import { isAnomalyDetection } from "../utils/guards.js";

import { WhenAlertingDialogLoaded } from "./WhenAlertingDialogLoaded.js";

/**
 * The alerting dialog's sensitivity field (the "Sensitivity" of anomaly detection), connected to
 * the dialog's state and rendered as a labelled form row.
 *
 * Renders {@link DefaultAlertingDialogSensitivity} inside {@link AutomationDialogFormField} with
 * the props of {@link useAlertingDialogSensitivityProps}; every prop passed here replaces the
 * hook's value for that prop wholesale. Renders nothing unless the draft uses anomaly detection,
 * and nothing while `useAlertingDialogContext().isLoading` is true.
 *
 * @alpha
 */
export function AlertingDialogSensitivity(overrides: Partial<IAlertingDialogSensitivityProps>): ReactElement {
    return (
        <WhenAlertingDialogLoaded>
            <ConnectedAlertingDialogSensitivity {...overrides} />
        </WhenAlertingDialogLoaded>
    );
}

function ConnectedAlertingDialogSensitivity(overrides: Partial<IAlertingDialogSensitivityProps>) {
    const props = { ...useAlertingDialogSensitivityProps(), ...overrides };
    const { editedAutomation } = useAlertDraft();
    if (!isAnomalyDetection(editedAutomation?.alert)) {
        return null;
    }
    return (
        <AutomationDialogFormField
            label={<FormattedMessage id="insightAlert.config.sensitivity" />}
            htmlFor={props.id}
        >
            <DefaultAlertingDialogSensitivity {...props} />
        </AutomationDialogFormField>
    );
}
