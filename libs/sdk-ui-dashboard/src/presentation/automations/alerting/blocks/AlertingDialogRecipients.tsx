// (C) 2026 GoodData Corporation

import { type IAutomationDialogRecipientsProps } from "../../shared/slots/types.js";
import { DefaultAlertingDialogRecipients } from "../DefaultAlertingDialog/DefaultAlertingDialogRecipients.js";
import { useAlertingDialogRecipientsProps } from "../state/useAlertingDialogRegionProps.js";

import { WhenAlertingDialogLoaded } from "./WhenAlertingDialogLoaded.js";

/**
 * The alerting dialog's recipients region, connected to the dialog's state.
 *
 * Renders {@link DefaultAlertingDialogRecipients} with the props of
 * {@link useAlertingDialogRecipientsProps}; every prop passed here replaces the hook's value for
 * that prop wholesale, e.g. `<AlertingDialogRecipients maxRecipients={3} />`. Renders nothing while
 * `useAlertingDialogContext().isLoading` is true.
 *
 * @alpha
 */
export function AlertingDialogRecipients(overrides: Partial<IAutomationDialogRecipientsProps>) {
    return (
        <WhenAlertingDialogLoaded>
            <ConnectedAlertingDialogRecipients {...overrides} />
        </WhenAlertingDialogLoaded>
    );
}

function ConnectedAlertingDialogRecipients(overrides: Partial<IAutomationDialogRecipientsProps>) {
    const defaultProps = useAlertingDialogRecipientsProps();
    return <DefaultAlertingDialogRecipients {...defaultProps} {...overrides} />;
}
