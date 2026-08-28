// (C) 2026 GoodData Corporation

import { type IAutomationDialogDestinationProps } from "../../../shared/slots/types.js";

import { DestinationSelect } from "./DestinationSelect/DestinationSelect.js";

const OVERLAY_POSITION_TYPE = "sameAsTarget";
const CLOSE_ON_PARENT_SCROLL = true;

/**
 * Default render of the scheduled-export dialog's destination region: the notification-channel
 * select. Props-driven — reads no context. The default dialog and
 * {@link ScheduledEmailDialogDestination} render it with
 * {@link useScheduledEmailDialogDestinationProps}; a `slots.Destination` slot receives it as `Default`.
 *
 * @alpha
 */
export function DefaultScheduledEmailDialogDestination({
    notificationChannels,
    selectedNotificationChannelId,
    onChange,
}: IAutomationDialogDestinationProps) {
    return (
        <DestinationSelect
            notificationChannels={notificationChannels}
            selectedItemId={selectedNotificationChannelId}
            onChange={onChange}
            closeOnParentScroll={CLOSE_ON_PARENT_SCROLL}
            overlayPositionType={OVERLAY_POSITION_TYPE}
        />
    );
}
