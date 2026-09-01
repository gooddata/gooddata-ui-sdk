// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { type IScheduledEmailDialogWidgetAttachmentsProps } from "../../types.js";

import { WidgetAttachments } from "./Attachments/WidgetAttachments.js";

/**
 * Default render of the scheduled-export dialog's widget-attachments field.
 * Props-driven — reads no context. The default dialog and {@link ScheduledEmailDialogWidgetAttachments}
 * render it with {@link useScheduledEmailDialogWidgetAttachmentsProps}.
 *
 * @alpha
 */
export function DefaultScheduledEmailDialogWidgetAttachments(
    props: IScheduledEmailDialogWidgetAttachmentsProps,
): ReactElement {
    return <WidgetAttachments {...props} />;
}
