// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { DefaultScheduledEmailDialogMessage } from "../DefaultScheduledEmailDialog/components/DefaultScheduledEmailDialogMessage.js";
import { useIsInPlatformChannel } from "../state/useIsInPlatformChannel.js";
import { useScheduledEmailDialogMessageProps } from "../state/useScheduledEmailDialogFieldProps.js";
import { type IScheduledEmailDialogMessageProps } from "../types.js";

import { WhenScheduledEmailDialogLoaded } from "./WhenScheduledEmailDialogLoaded.js";

/**
 * The scheduled-export dialog's message field, connected to the dialog's state.
 *
 * Renders {@link DefaultScheduledEmailDialogMessage} with the props of
 * {@link useScheduledEmailDialogMessageProps}; every prop passed here replaces the hook's value for
 * that prop wholesale. Renders nothing while `useScheduledEmailDialogContext().isLoading` is true
 * and for an in-platform notification channel (which has no e-mail message), the same visibility
 * the default dialog gives the field.
 *
 * @alpha
 */
export function ScheduledEmailDialogMessage(props: Partial<IScheduledEmailDialogMessageProps>): ReactElement {
    return (
        <WhenScheduledEmailDialogLoaded>
            <ConnectedScheduledEmailDialogMessage {...props} />
        </WhenScheduledEmailDialogLoaded>
    );
}

function ConnectedScheduledEmailDialogMessage(overrides: Partial<IScheduledEmailDialogMessageProps>) {
    const defaultProps = useScheduledEmailDialogMessageProps();
    const isInPlatformChannel = useIsInPlatformChannel();
    if (isInPlatformChannel) {
        return null;
    }
    return <DefaultScheduledEmailDialogMessage {...defaultProps} {...overrides} />;
}
