// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { RecurrenceForm } from "@gooddata/sdk-ui-kit";

import { type IScheduledEmailDialogRecurrenceProps } from "../../types.js";

/**
 * Default render of the scheduled-export dialog's recurrence field: the recurrence form.
 * Props-driven — reads no context. The default dialog and {@link ScheduledEmailDialogRecurrence}
 * render it with {@link useScheduledEmailDialogRecurrenceProps}.
 *
 * @alpha
 */
export function DefaultScheduledEmailDialogRecurrence(
    props: IScheduledEmailDialogRecurrenceProps,
): ReactElement {
    return <RecurrenceForm {...props} />;
}
