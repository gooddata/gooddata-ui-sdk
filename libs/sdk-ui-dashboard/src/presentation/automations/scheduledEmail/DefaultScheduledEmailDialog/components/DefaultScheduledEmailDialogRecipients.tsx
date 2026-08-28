// (C) 2026 GoodData Corporation

import { type IScheduledEmailDialogRecipientsProps } from "../../types.js";

import { RecipientsSelect } from "./RecipientsSelect/RecipientsSelect.js";

/**
 * Default render of the scheduled-export dialog's recipients region: the recipients select.
 * Props-driven — reads no context. The default dialog and {@link ScheduledEmailDialogRecipients}
 * render it with {@link useScheduledEmailDialogRecipientsProps}; a `slots.Recipients` slot receives
 * it as `Default`.
 *
 * @alpha
 */
export function DefaultScheduledEmailDialogRecipients(props: IScheduledEmailDialogRecipientsProps) {
    return <RecipientsSelect id="schedule.email.recipients" {...props} />;
}
