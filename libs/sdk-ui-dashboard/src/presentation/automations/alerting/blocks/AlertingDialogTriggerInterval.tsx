// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { defineMessage } from "react-intl";

import { AutomationDialogFormField } from "../../shared/slots/AutomationDialogFormField.js";
import { DefaultAlertingDialogTriggerInterval } from "../DefaultAlertingDialog/DefaultAlertingDialogTriggerInterval.js";
import { useAlertDraft } from "../state/AlertDraftContext.js";
import { useAlertingDialogTriggerIntervalProps } from "../state/useAlertingDialogFieldProps.js";
import { type IAlertingDialogTriggerIntervalProps } from "../types.js";

import { AlertingDialogFieldLabelWithTooltip } from "./AlertingDialogFieldLabelWithTooltip.js";
import { WhenAlertingDialogLoaded } from "./WhenAlertingDialogLoaded.js";

const INTERVAL_LABEL = defineMessage({ id: "insightAlert.config.interval" });
const INTERVAL_TOOLTIP = defineMessage({ id: "insightAlert.config.interval.tooltip" });

/**
 * The alerting dialog's trigger-interval field (the interval a once-per-interval trigger notifies
 * on), connected to the dialog's state and rendered as a labelled form row.
 *
 * Renders {@link DefaultAlertingDialogTriggerInterval} inside {@link AutomationDialogFormField}
 * with the props of {@link useAlertingDialogTriggerIntervalProps}; every prop passed here replaces
 * the hook's value for that prop wholesale. Renders nothing unless the draft's trigger mode is
 * `ONCE_PER_INTERVAL`, and nothing while `useAlertingDialogContext().isLoading` is true.
 *
 * @alpha
 */
export function AlertingDialogTriggerInterval(
    overrides: Partial<IAlertingDialogTriggerIntervalProps>,
): ReactElement {
    return (
        <WhenAlertingDialogLoaded>
            <ConnectedAlertingDialogTriggerInterval {...overrides} />
        </WhenAlertingDialogLoaded>
    );
}

function ConnectedAlertingDialogTriggerInterval(overrides: Partial<IAlertingDialogTriggerIntervalProps>) {
    const props = { ...useAlertingDialogTriggerIntervalProps(), ...overrides };
    const { editedAutomation } = useAlertDraft();
    if (editedAutomation?.alert?.trigger.mode !== "ONCE_PER_INTERVAL") {
        return null;
    }
    return (
        <AutomationDialogFormField
            label={<AlertingDialogFieldLabelWithTooltip label={INTERVAL_LABEL} tooltip={INTERVAL_TOOLTIP} />}
            htmlFor={props.id}
        >
            <DefaultAlertingDialogTriggerInterval {...props} />
        </AutomationDialogFormField>
    );
}
