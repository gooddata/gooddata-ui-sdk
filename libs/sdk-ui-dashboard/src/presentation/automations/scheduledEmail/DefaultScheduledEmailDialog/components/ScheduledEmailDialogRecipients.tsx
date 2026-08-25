// (C) 2026 GoodData Corporation

import { type IScheduledEmailDialogRecipientsProps } from "../../types.js";

import { RecipientsSelect } from "./RecipientsSelect/RecipientsSelect.js";

/**
 * Default implementation of the scheduled email dialog's recipients region.
 */
export function ScheduledEmailDialogRecipients(props: IScheduledEmailDialogRecipientsProps) {
    return <RecipientsSelect id="schedule.email.recipients" {...props} />;
}
