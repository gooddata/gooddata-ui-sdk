// (C) 2026 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { type IAutomationDialogDestinationProps } from "../../shared/slots/types.js";

import { AlertDestinationSelect } from "./components/AlertDestinationSelect.js";
import { FormField } from "./FormField.js";

const OVERLAY_POSITION_TYPE = "sameAsTarget";
const CLOSE_ON_PARENT_SCROLL = true;

/**
 * Default implementation of the alerting dialog's destination region (the "Action" row).
 */
export function AlertingDialogDestination({
    notificationChannels,
    selectedNotificationChannelId,
    onChange,
}: IAutomationDialogDestinationProps) {
    return (
        <FormField label={<FormattedMessage id="insightAlert.config.action" />} htmlFor="alert.destination">
            <AlertDestinationSelect
                id="alert.destination"
                selectedDestination={selectedNotificationChannelId}
                onDestinationChange={onChange}
                destinations={notificationChannels}
                overlayPositionType={OVERLAY_POSITION_TYPE}
                closeOnParentScroll={CLOSE_ON_PARENT_SCROLL}
            />
        </FormField>
    );
}
