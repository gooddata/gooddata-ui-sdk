// (C) 2026 GoodData Corporation

import { forwardRef } from "react";

import { DefaultScheduledEmailDialogHeader } from "../DefaultScheduledEmailDialog/components/DefaultScheduledEmailDialogHeader.js";
import { useScheduledEmailDialogHeaderProps } from "../state/useScheduledEmailDialogRegionProps.js";
import { type IScheduledEmailDialogHeaderProps } from "../types.js";

import { WhenScheduledEmailDialogLoaded } from "./WhenScheduledEmailDialogLoaded.js";

const noop = () => {};

/**
 * The scheduled-export dialog's header region (the back button and the title input), connected to the
 * dialog's state.
 *
 * Renders {@link DefaultScheduledEmailDialogHeader} with the props of
 * {@link useScheduledEmailDialogHeaderProps}; every prop passed here replaces the hook's value for that
 * prop wholesale. Pass `onBack` to get the back button, `ref` to receive the title input, and
 * `onTitleKeyDown` to submit on Enter — the default dialog passes a handler over its single
 * {@link useSaveScheduledEmailToBackend} instance; without it Enter does nothing here. Renders
 * nothing while `useScheduledEmailDialogContext().isLoading` is true, which on scheduled email is
 * the ordinary path while a widget export's filters load.
 *
 * @alpha
 */
export const ScheduledEmailDialogHeader = forwardRef<
    HTMLInputElement,
    Partial<IScheduledEmailDialogHeaderProps>
>(function ScheduledEmailDialogHeader(props, ref) {
    return (
        <WhenScheduledEmailDialogLoaded>
            <ConnectedScheduledEmailDialogHeader {...props} ref={ref} />
        </WhenScheduledEmailDialogLoaded>
    );
});

const ConnectedScheduledEmailDialogHeader = forwardRef<
    HTMLInputElement,
    Partial<IScheduledEmailDialogHeaderProps>
>(function ConnectedScheduledEmailDialogHeader({ onBack, onTitleKeyDown, ...overrides }, ref) {
    const defaultProps = useScheduledEmailDialogHeaderProps({
        onBack,
        onTitleKeyDown: onTitleKeyDown ?? noop,
        ref,
    });
    return <DefaultScheduledEmailDialogHeader {...defaultProps} {...overrides} />;
});
