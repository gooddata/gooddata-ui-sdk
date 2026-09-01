// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { DefaultScheduledEmailDialogRecurrence } from "../DefaultScheduledEmailDialog/components/DefaultScheduledEmailDialogRecurrence.js";
import { useScheduledEmailDialogRecurrenceProps } from "../state/useScheduledEmailDialogFieldProps.js";
import { type IScheduledEmailDialogRecurrenceProps } from "../types.js";

import { WhenScheduledEmailDialogLoaded } from "./WhenScheduledEmailDialogLoaded.js";

const noop = () => {};

/**
 * The scheduled-export dialog's recurrence field, connected to the dialog's state.
 *
 * Renders {@link DefaultScheduledEmailDialogRecurrence} with the props of
 * {@link useScheduledEmailDialogRecurrenceProps}; every prop passed here replaces the hook's value
 * for that prop wholesale. Pass `onKeyDownSubmit` to submit on Enter from the recurrence inputs —
 * the default dialog passes its save action; without it Enter does nothing here. Renders nothing
 * while `useScheduledEmailDialogContext().isLoading` is true; otherwise ungated, unlike the other
 * General-tab fields.
 *
 * @alpha
 */
export function ScheduledEmailDialogRecurrence(
    props: Partial<IScheduledEmailDialogRecurrenceProps>,
): ReactElement {
    return (
        <WhenScheduledEmailDialogLoaded>
            <ConnectedScheduledEmailDialogRecurrence {...props} />
        </WhenScheduledEmailDialogLoaded>
    );
}

function ConnectedScheduledEmailDialogRecurrence({
    onKeyDownSubmit,
    ...overrides
}: Partial<IScheduledEmailDialogRecurrenceProps>) {
    const defaultProps = useScheduledEmailDialogRecurrenceProps({ onKeyDownSubmit: onKeyDownSubmit ?? noop });
    return <DefaultScheduledEmailDialogRecurrence {...defaultProps} {...overrides} />;
}
