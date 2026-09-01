// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { useScheduledEmailDialogContext } from "../../contexts/ScheduledEmailDialogContext.js";
import { DefaultScheduledEmailDialogDashboardAttachments } from "../DefaultScheduledEmailDialog/components/DefaultScheduledEmailDialogDashboardAttachments.js";
import { useScheduledEmailDialogDashboardAttachmentsProps } from "../state/useScheduledEmailDialogFieldProps.js";
import { type IScheduledEmailDialogDashboardAttachmentsProps } from "../types.js";

import { WhenScheduledEmailDialogLoaded } from "./WhenScheduledEmailDialogLoaded.js";

/**
 * The scheduled-export dialog's dashboard-attachments field, connected to the dialog's state.
 *
 * Renders {@link DefaultScheduledEmailDialogDashboardAttachments} with the props of
 * {@link useScheduledEmailDialogDashboardAttachmentsProps}; every prop passed here replaces the
 * hook's value for that prop wholesale. Renders nothing while
 * `useScheduledEmailDialogContext().isLoading` is true and when the dialog context has a `widget`
 * (a widget schedule renders {@link ScheduledEmailDialogWidgetAttachments} instead), the same
 * visibility the default dialog gives the field.
 *
 * @alpha
 */
export function ScheduledEmailDialogDashboardAttachments(
    props: Partial<IScheduledEmailDialogDashboardAttachmentsProps>,
): ReactElement {
    return (
        <WhenScheduledEmailDialogLoaded>
            <ConnectedScheduledEmailDialogDashboardAttachments {...props} />
        </WhenScheduledEmailDialogLoaded>
    );
}

function ConnectedScheduledEmailDialogDashboardAttachments(
    overrides: Partial<IScheduledEmailDialogDashboardAttachmentsProps>,
) {
    const defaultProps = useScheduledEmailDialogDashboardAttachmentsProps();
    const { widget } = useScheduledEmailDialogContext();
    if (widget) {
        return null;
    }
    return <DefaultScheduledEmailDialogDashboardAttachments {...defaultProps} {...overrides} />;
}
