// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { defineMessage } from "react-intl";

import { AutomationDialogFormField } from "../../shared/slots/AutomationDialogFormField.js";
import { DefaultAlertingDialogGranularity } from "../DefaultAlertingDialog/DefaultAlertingDialogGranularity.js";
import { useAlertDraft } from "../state/AlertDraftContext.js";
import { useAlertingDialogGranularityProps } from "../state/useAlertingDialogFieldProps.js";
import { type IAlertingDialogGranularityProps } from "../types.js";
import { isAnomalyDetection } from "../utils/guards.js";

import { AlertingDialogFieldLabelWithTooltip } from "./AlertingDialogFieldLabelWithTooltip.js";
import { WhenAlertingDialogLoaded } from "./WhenAlertingDialogLoaded.js";

const GRANULARITY_LABEL = defineMessage({ id: "insightAlert.config.granularity" });
const GRANULARITY_TOOLTIP = defineMessage({ id: "insightAlert.config.granularity.tooltip" });

/**
 * The alerting dialog's granularity field (the period anomaly detection evaluates over), connected
 * to the dialog's state and rendered as a labelled form row.
 *
 * Renders {@link DefaultAlertingDialogGranularity} inside {@link AutomationDialogFormField} with
 * the props of {@link useAlertingDialogGranularityProps}; every prop passed here replaces the
 * hook's value for that prop wholesale. Renders nothing unless the draft uses anomaly detection,
 * and nothing while `useAlertingDialogContext().isLoading` is true.
 *
 * @alpha
 */
export function AlertingDialogGranularity(overrides: Partial<IAlertingDialogGranularityProps>): ReactElement {
    return (
        <WhenAlertingDialogLoaded>
            <ConnectedAlertingDialogGranularity {...overrides} />
        </WhenAlertingDialogLoaded>
    );
}

function ConnectedAlertingDialogGranularity(overrides: Partial<IAlertingDialogGranularityProps>) {
    const props = { ...useAlertingDialogGranularityProps(), ...overrides };
    const { editedAutomation } = useAlertDraft();
    if (!isAnomalyDetection(editedAutomation?.alert)) {
        return null;
    }
    return (
        <AutomationDialogFormField
            label={
                <AlertingDialogFieldLabelWithTooltip
                    label={GRANULARITY_LABEL}
                    tooltip={GRANULARITY_TOOLTIP}
                />
            }
            htmlFor={props.id}
        >
            <DefaultAlertingDialogGranularity {...props} />
        </AutomationDialogFormField>
    );
}
