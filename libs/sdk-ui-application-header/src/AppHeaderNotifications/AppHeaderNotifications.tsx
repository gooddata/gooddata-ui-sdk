// (C) 2024-2026 GoodData Corporation

import { type INotification } from "@gooddata/sdk-model";
import { type ILocale } from "@gooddata/sdk-ui";
import { DefaultNotificationsPanelButton, NotificationsPanel } from "@gooddata/sdk-ui-ext";

import { getDashboardUrl } from "./dashboardUrl.js";

/**
 * @alpha
 */
export function AppHeaderNotifications({
    isMobile = false,
    closeNotificationsOverlay,
    locale,
    useAsOfDateParam,
    enableExportToDocumentStorage,
}: {
    isMobile?: boolean;
    closeNotificationsOverlay?: () => void;
    locale?: ILocale;
    useAsOfDateParam?: boolean;
    enableExportToDocumentStorage?: boolean;
}) {
    const onNotificationClick = (notification: INotification) => {
        const url = getDashboardUrl(notification, useAsOfDateParam);

        if (url && notification.notificationType === "alertNotification") {
            closeNotificationsOverlay?.();

            // When query params do not change, we want to trigger router with location change manually
            if (window.location.href === url) {
                window.dispatchEvent(new HashChangeEvent("hashchange"));
            } else {
                window.location.assign(url);
            }
        }
    };

    return (
        <NotificationsPanel
            NotificationsPanelButton={DefaultNotificationsPanelButton}
            onNotificationClick={onNotificationClick}
            renderInline={isMobile}
            enableScheduleNotifications={enableExportToDocumentStorage}
            locale={locale}
        />
    );
}
