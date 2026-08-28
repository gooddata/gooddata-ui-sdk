// (C) 2026 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { type IAutomationDialogDestinationProps } from "../../shared/slots/types.js";

import { AlertDestinationSelect } from "./components/AlertDestinationSelect.js";
import { FormField } from "./FormField.js";

const OVERLAY_POSITION_TYPE = "sameAsTarget";
const CLOSE_ON_PARENT_SCROLL = true;

/**
 * Default render of the alerting dialog's destination region: the "Action" row selecting the
 * notification channel. Props-driven — reads no context. The default dialog and
 * {@link AlertingDialogDestination} render it with {@link useAlertingDialogDestinationProps}; a
 * `slots.Destination` slot receives it as `Default`.
 *
 * @alpha
 */
export function DefaultAlertingDialogDestination({
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
