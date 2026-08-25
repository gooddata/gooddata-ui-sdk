// (C) 2026 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { RecipientsSelect } from "../../scheduledEmail/DefaultScheduledEmailDialog/components/RecipientsSelect/RecipientsSelect.js";
import { type IAutomationDialogRecipientsProps } from "../../shared/slots/types.js";

import { FormField } from "./FormField.js";

/**
 * Default implementation of the alerting dialog's recipients region. The label comes from the
 * form field row, so the select's own label is off.
 */
export function AlertingDialogRecipients(props: IAutomationDialogRecipientsProps) {
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
