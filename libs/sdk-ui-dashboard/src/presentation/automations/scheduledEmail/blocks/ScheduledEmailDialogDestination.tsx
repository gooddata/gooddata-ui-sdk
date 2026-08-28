// (C) 2026 GoodData Corporation

import { type IAutomationDialogDestinationProps } from "../../shared/slots/types.js";
import { DefaultScheduledEmailDialogDestination } from "../DefaultScheduledEmailDialog/components/DefaultScheduledEmailDialogDestination.js";
import { useScheduledEmailDialogDestinationProps } from "../state/useScheduledEmailDialogRegionProps.js";

import { WhenScheduledEmailDialogLoaded } from "./WhenScheduledEmailDialogLoaded.js";

/**
 * The scheduled-export dialog's destination region (the notification-channel select), connected to
 * the dialog's state.
 *
 * Renders {@link DefaultScheduledEmailDialogDestination} with the props of
 * {@link useScheduledEmailDialogDestinationProps}; every prop passed here replaces the hook's value
 * for that prop wholesale. Renders nothing while `useScheduledEmailDialogContext().isLoading` is true.
 *
 * @alpha
 */
export function ScheduledEmailDialogDestination(overrides: Partial<IAutomationDialogDestinationProps>) {
    return (
        <WhenScheduledEmailDialogLoaded>
            <ConnectedScheduledEmailDialogDestination {...overrides} />
        </WhenScheduledEmailDialogLoaded>
    );
}

function ConnectedScheduledEmailDialogDestination(overrides: Partial<IAutomationDialogDestinationProps>) {
    const defaultProps = useScheduledEmailDialogDestinationProps();
    return <DefaultScheduledEmailDialogDestination {...defaultProps} {...overrides} />;
}
