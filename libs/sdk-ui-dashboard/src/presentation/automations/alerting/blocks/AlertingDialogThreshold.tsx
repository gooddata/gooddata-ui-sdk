// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { FormattedMessage } from "react-intl";

import { AutomationDialogFormField } from "../../shared/slots/AutomationDialogFormField.js";
import { DefaultAlertingDialogThreshold } from "../DefaultAlertingDialog/DefaultAlertingDialogThreshold.js";
import { useAlertDraft } from "../state/AlertDraftContext.js";
import { useAlertingDialogThresholdProps } from "../state/useAlertingDialogFieldProps.js";
import { type IAlertingDialogThresholdProps } from "../types.js";
import { isAnomalyDetection } from "../utils/guards.js";

import { WhenAlertingDialogLoaded } from "./WhenAlertingDialogLoaded.js";

/**
 * The alerting dialog's threshold field (the value a fixed-threshold, change or difference
 * condition is compared against), connected to the dialog's state and rendered as a labelled form
 * row.
 *
 * Renders {@link DefaultAlertingDialogThreshold} inside {@link AutomationDialogFormField} with the
 * props of {@link useAlertingDialogThresholdProps}; every prop passed here replaces the hook's
 * value for that prop wholesale. **The one `useAlertThreshold` mount**:
 * {@link useAlertingDialogThresholdProps} owns the field's state and writes the draft
 * (auto-computing a new alert's threshold), so place this block once per dialog and do not also
 * call the hook. Renders nothing while the draft uses anomaly detection (that condition has no
 * threshold); the hook stays mounted behind the gate, so the field's touched state survives a
 * switch to anomaly detection and back. Renders nothing while
 * `useAlertingDialogContext().isLoading` is true.
 *
 * @alpha
 */
export function AlertingDialogThreshold(overrides: Partial<IAlertingDialogThresholdProps>): ReactElement {
    return (
        <WhenAlertingDialogLoaded>
            <ConnectedAlertingDialogThreshold {...overrides} />
        </WhenAlertingDialogLoaded>
    );
}

function ConnectedAlertingDialogThreshold(overrides: Partial<IAlertingDialogThresholdProps>) {
    const props = { ...useAlertingDialogThresholdProps(), ...overrides };
    const { editedAutomation } = useAlertDraft();
    if (isAnomalyDetection(editedAutomation?.alert)) {
        return null;
    }
    return (
        <AutomationDialogFormField
            label={<FormattedMessage id="insightAlert.config.threshold" />}
            htmlFor={props.id}
        >
            <DefaultAlertingDialogThreshold {...props} />
        </AutomationDialogFormField>
    );
}
