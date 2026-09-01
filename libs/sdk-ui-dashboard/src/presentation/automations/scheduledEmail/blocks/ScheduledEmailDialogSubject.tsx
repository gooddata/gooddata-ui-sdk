// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { DefaultScheduledEmailDialogSubject } from "../DefaultScheduledEmailDialog/components/DefaultScheduledEmailDialogSubject.js";
import { useIsInPlatformChannel } from "../state/useIsInPlatformChannel.js";
import { useScheduledEmailDialogSubjectProps } from "../state/useScheduledEmailDialogFieldProps.js";
import { type IScheduledEmailDialogSubjectProps } from "../types.js";

import { WhenScheduledEmailDialogLoaded } from "./WhenScheduledEmailDialogLoaded.js";

const noop = () => {};

/**
 * The scheduled-export dialog's subject field, connected to the dialog's state.
 *
 * Renders {@link DefaultScheduledEmailDialogSubject} with the props of
 * {@link useScheduledEmailDialogSubjectProps}; every prop passed here replaces the hook's value for
 * that prop wholesale. Pass `onKeyDownSubmit` to submit on Enter from the subject input — the
 * default dialog passes its save action; without it Enter does nothing here. Renders nothing while
 * `useScheduledEmailDialogContext().isLoading` is true and for an in-platform notification channel
 * (which has no e-mail subject), the same visibility the default dialog gives the field.
 *
 * @alpha
 */
export function ScheduledEmailDialogSubject(props: Partial<IScheduledEmailDialogSubjectProps>): ReactElement {
    return (
        <WhenScheduledEmailDialogLoaded>
            <ConnectedScheduledEmailDialogSubject {...props} />
        </WhenScheduledEmailDialogLoaded>
    );
}

function ConnectedScheduledEmailDialogSubject({
    onKeyDownSubmit,
    ...overrides
}: Partial<IScheduledEmailDialogSubjectProps>) {
    const defaultProps = useScheduledEmailDialogSubjectProps({ onKeyDownSubmit: onKeyDownSubmit ?? noop });
    const isInPlatformChannel = useIsInPlatformChannel();
    if (isInPlatformChannel) {
        return null;
    }
    return <DefaultScheduledEmailDialogSubject {...defaultProps} {...overrides} />;
}
