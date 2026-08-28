// (C) 2026 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { RecipientsSelect } from "../../scheduledEmail/DefaultScheduledEmailDialog/components/RecipientsSelect/RecipientsSelect.js";
import { type IAutomationDialogRecipientsProps } from "../../shared/slots/types.js";

import { FormField } from "./FormField.js";

/**
 * Default render of the alerting dialog's recipients region: the recipients select in a form-field
 * row; the row carries the label, so the select's own label is off. Props-driven — reads no context.
 * The default dialog and {@link AlertingDialogRecipients} render it with
 * {@link useAlertingDialogRecipientsProps}; a `slots.Recipients` slot receives it as `Default`.
 *
 * @alpha
 */
export function DefaultAlertingDialogRecipients(props: IAutomationDialogRecipientsProps) {
    return (
        <FormField
            label={<FormattedMessage id="insightAlert.config.recipients" />}
            htmlFor="alert.recipients"
            fullWidth
        >
            <RecipientsSelect id="alert.recipients" showLabel={false} {...props} />
        </FormField>
    );
}
