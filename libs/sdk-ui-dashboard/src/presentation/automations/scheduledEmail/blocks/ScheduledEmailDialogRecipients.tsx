// (C) 2026 GoodData Corporation

import { DefaultScheduledEmailDialogRecipients } from "../DefaultScheduledEmailDialog/components/DefaultScheduledEmailDialogRecipients.js";
import { useScheduledEmailDialogRecipientsProps } from "../state/useScheduledEmailDialogRegionProps.js";
import { type IScheduledEmailDialogRecipientsProps } from "../types.js";

import { WhenScheduledEmailDialogLoaded } from "./WhenScheduledEmailDialogLoaded.js";

const noop = () => {};

/**
 * The scheduled-export dialog's recipients region, connected to the dialog's state.
 *
 * Renders {@link DefaultScheduledEmailDialogRecipients} with the props of
 * {@link useScheduledEmailDialogRecipientsProps}; every prop passed here replaces the hook's value
 * for that prop wholesale, e.g. `<ScheduledEmailDialogRecipients maxRecipients={3} />`. Pass
 * `onKeyDownSubmit` to submit on Enter from the recipients input — the default dialog passes a
 * handler over its single {@link useSaveScheduledEmailToBackend} instance; without it Enter does
 * nothing here. Renders nothing while `useScheduledEmailDialogContext().isLoading` is true.
 *
 * @alpha
 */
export function ScheduledEmailDialogRecipients(props: Partial<IScheduledEmailDialogRecipientsProps>) {
    return (
        <WhenScheduledEmailDialogLoaded>
            <ConnectedScheduledEmailDialogRecipients {...props} />
        </WhenScheduledEmailDialogLoaded>
    );
}

function ConnectedScheduledEmailDialogRecipients({
    onKeyDownSubmit,
    ...overrides
}: Partial<IScheduledEmailDialogRecipientsProps>) {
    const defaultProps = useScheduledEmailDialogRecipientsProps({ onKeyDownSubmit: onKeyDownSubmit ?? noop });
    return <DefaultScheduledEmailDialogRecipients {...defaultProps} {...overrides} />;
}
