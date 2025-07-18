// (C) 2024-2025 GoodData Corporation
import { IAlertDescription, IAlertNotification } from "@gooddata/sdk-model";
import { alignConfigToAlignPoint, Overlay, UiButton } from "@gooddata/sdk-ui-kit";
import { useRef, useState } from "react";
import { defineMessages, IntlShape, useIntl } from "react-intl";
import { NotificationTriggersDetailDialog } from "./NotificationTriggersDetailDialog.js";

const ALIGN_POINTS = [
    alignConfigToAlignPoint({
        triggerAlignPoint: "bottom-right",
        overlayAlignPoint: "top-right",
        offset: { x: 2, y: 3 },
    }),
    alignConfigToAlignPoint({
        triggerAlignPoint: "bottom-left",
        overlayAlignPoint: "top-left",
        offset: { x: 2, y: 3 },
    }),
];

const messages = defineMessages({
    triggersTitle: {
        id: "notifications.panel.triggers.title",
    },
});

/**
 * @internal
 */
export interface INotificationTriggerDetailProps {
    notification: IAlertNotification;
}

/**
 * @internal
 */
export function NotificationTriggerDetail({ notification }: INotificationTriggerDetailProps) {
    const [isTriggersDialogOpen, setIsTriggersDialogOpen] = useState(false);
    const closeTriggersDialog = () => setIsTriggersDialogOpen(false);
    const toggleTriggersDialog = () => setIsTriggersDialogOpen((x) => !x);
    const intl = useIntl();
    const ref = useRef<HTMLButtonElement>(null);
    const isSliced = notification.details.data.alert.attribute;
    const triggersTitle = isSliced ? getTriggersTitle(intl, notification.details.data.alert) : "";

    return (
        <>
            <UiButton
                ref={ref}
                onClick={(e) => {
                    e.stopPropagation();
                    toggleTriggersDialog();
                }}
                onKeyDown={(e) => {
                    e.stopPropagation();
                }}
                variant="tertiary"
                size="small"
                label={triggersTitle}
                dataId="notification-detail"
            />
            {isTriggersDialogOpen ? (
                <Overlay
                    isModal={false}
                    alignTo={ref.current}
                    alignPoints={ALIGN_POINTS}
                    closeOnEscape
                    closeOnOutsideClick
                    closeOnParentScroll={false}
                    closeOnMouseDrag={false}
                    onClose={closeTriggersDialog}
                >
                    <NotificationTriggersDetailDialog
                        notification={notification}
                        onClose={closeTriggersDialog}
                    />
                </Overlay>
            ) : null}
        </>
    );
}

function getTriggersTitle(intl: IntlShape, alertDescription: IAlertDescription) {
    return intl.formatMessage(messages.triggersTitle, {
        triggeredCount: alertDescription.triggeredCount,
        totalCount: alertDescription.totalValueCount,
    });
}
