// (C) 2026 GoodData Corporation

import { type IAutomationDialogDestinationProps } from "../../../shared/slots/types.js";

import { DestinationSelect } from "./DestinationSelect/DestinationSelect.js";

const OVERLAY_POSITION_TYPE = "sameAsTarget";
const CLOSE_ON_PARENT_SCROLL = true;

/**
 * Default implementation of the scheduled email dialog's destination region.
 */
export function ScheduledEmailDialogDestination({
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
