// (C) 2026 GoodData Corporation

import { type IAutomationDialogDestinationProps } from "../../shared/slots/types.js";
import { DefaultAlertingDialogDestination } from "../DefaultAlertingDialog/DefaultAlertingDialogDestination.js";
import { useAlertingDialogDestinationProps } from "../state/useAlertingDialogRegionProps.js";

import { WhenAlertingDialogLoaded } from "./WhenAlertingDialogLoaded.js";

/**
 * The alerting dialog's destination region (the notification-channel select), connected to the
 * dialog's state.
 *
 * Renders {@link DefaultAlertingDialogDestination} with the props of
 * {@link useAlertingDialogDestinationProps}; every prop passed here replaces the hook's value for
 * that prop wholesale. Renders nothing while `useAlertingDialogContext().isLoading` is true. The
 * default dialog renders this region only when more than one channel exists; the block renders
 * wherever it is placed — a shell decides from `useAlertingDialogContext().notificationChannels`.
 *
 * @alpha
 */
export function AlertingDialogDestination(overrides: Partial<IAutomationDialogDestinationProps>) {
    return (
        <WhenAlertingDialogLoaded>
            <ConnectedAlertingDialogDestination {...overrides} />
        </WhenAlertingDialogLoaded>
    );
}

function ConnectedAlertingDialogDestination(overrides: Partial<IAutomationDialogDestinationProps>) {
    const defaultProps = useAlertingDialogDestinationProps();
    return <DefaultAlertingDialogDestination {...defaultProps} {...overrides} />;
}
