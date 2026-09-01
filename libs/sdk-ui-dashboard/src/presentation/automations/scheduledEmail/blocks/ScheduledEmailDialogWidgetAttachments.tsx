// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { useScheduledEmailDialogContext } from "../../contexts/ScheduledEmailDialogContext.js";
import { DefaultScheduledEmailDialogWidgetAttachments } from "../DefaultScheduledEmailDialog/components/DefaultScheduledEmailDialogWidgetAttachments.js";
import { useScheduledEmailDialogWidgetAttachmentsProps } from "../state/useScheduledEmailDialogFieldProps.js";
import { type IScheduledEmailDialogWidgetAttachmentsProps } from "../types.js";

import { WhenScheduledEmailDialogLoaded } from "./WhenScheduledEmailDialogLoaded.js";

/**
 * The scheduled-export dialog's widget-attachments field, connected to the dialog's state.
 *
 * Renders {@link DefaultScheduledEmailDialogWidgetAttachments} with the props of
 * {@link useScheduledEmailDialogWidgetAttachmentsProps}; every prop passed here replaces the hook's
 * value for that prop wholesale. Renders nothing while `useScheduledEmailDialogContext().isLoading`
 * is true and when the dialog context has no `widget` (a dashboard schedule renders
 * {@link ScheduledEmailDialogDashboardAttachments} instead), the same visibility the default dialog
 * gives the field.
 *
 * @alpha
 */
export function ScheduledEmailDialogWidgetAttachments(
    props: Partial<IScheduledEmailDialogWidgetAttachmentsProps>,
): ReactElement {
    return (
        <WhenScheduledEmailDialogLoaded>
            <ConnectedScheduledEmailDialogWidgetAttachments {...props} />
        </WhenScheduledEmailDialogLoaded>
    );
}

function ConnectedScheduledEmailDialogWidgetAttachments(
    overrides: Partial<IScheduledEmailDialogWidgetAttachmentsProps>,
) {
    const defaultProps = useScheduledEmailDialogWidgetAttachmentsProps();
    const { widget } = useScheduledEmailDialogContext();
    if (!widget) {
        return null;
    }
    return <DefaultScheduledEmailDialogWidgetAttachments {...defaultProps} {...overrides} />;
}
