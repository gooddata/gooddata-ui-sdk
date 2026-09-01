// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { type IScheduledEmailDialogMessageProps } from "../../types.js";

import { MessageForm } from "./MessageForm/MessageForm.js";

/**
 * Default render of the scheduled-export dialog's message field.
 * Props-driven — reads no context. The default dialog and {@link ScheduledEmailDialogMessage}
 * render it with {@link useScheduledEmailDialogMessageProps}.
 *
 * @alpha
 */
export function DefaultScheduledEmailDialogMessage(props: IScheduledEmailDialogMessageProps): ReactElement {
    return <MessageForm {...props} />;
}
