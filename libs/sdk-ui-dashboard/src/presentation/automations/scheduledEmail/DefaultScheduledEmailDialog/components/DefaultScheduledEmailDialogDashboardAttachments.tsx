// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { type IScheduledEmailDialogDashboardAttachmentsProps } from "../../types.js";

import { DashboardAttachments } from "./Attachments/DashboardAttachments.js";

/**
 * Default render of the scheduled-export dialog's dashboard-attachments field.
 * Props-driven — reads no context. The default dialog and {@link ScheduledEmailDialogDashboardAttachments}
 * render it with {@link useScheduledEmailDialogDashboardAttachmentsProps}.
 *
 * @alpha
 */
export function DefaultScheduledEmailDialogDashboardAttachments(
    props: IScheduledEmailDialogDashboardAttachmentsProps,
): ReactElement {
    return <DashboardAttachments {...props} />;
}
