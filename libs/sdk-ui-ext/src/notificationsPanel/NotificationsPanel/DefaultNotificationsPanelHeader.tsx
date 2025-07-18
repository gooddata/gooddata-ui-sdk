// (C) 2024-2025 GoodData Corporation
import { useCallback, useMemo } from "react";
import { ITab, Tabs, UiButton } from "@gooddata/sdk-ui-kit";
import { bem } from "../bem.js";
import { INotificationsPanelView } from "../types.js";
import { defineMessages, useIntl } from "react-intl";

/**
 * Props for the NotificationsPanelHeader component.
 *
 * @public
 */
export interface INotificationsPanelHeaderComponentProps {
    /**
     * The currently active view of the notifications panel.
     */
    activeView: INotificationsPanelView;

    /**
     * The callback to change the active view.
     */
    changeActiveView: (view: INotificationsPanelView) => void;

    /**
     * Indicates if there are unread notifications.
     */
    hasUnreadNotifications: boolean;

    /**
     * The number of unread notifications.
     */
    unreadNotificationsCount: number;

    /**
     * The callback to mark all notifications as read.
     */
    markAllNotificationsAsRead: () => void;
}

const { b, e } = bem("gd-ui-ext-notifications-panel-header");

/**
 * Default implementation of the notifications panel header.
 *
 * @public
 */
export function DefaultNotificationsPanelHeader({
    activeView,
    changeActiveView,
    markAllNotificationsAsRead,
    hasUnreadNotifications,
    unreadNotificationsCount,
}: INotificationsPanelHeaderComponentProps) {
    const intl = useIntl();
    const tabs = useMemo(() => getTabs(unreadNotificationsCount), [unreadNotificationsCount]);

    const activeTabId = activeView === "unread" ? messages.tabUnread.id : messages.tabAll.id;

    const onTabSelect = useCallback(
        (tab: ITab) => {
            const targetView = tab.id === messages.tabUnread.id ? "unread" : "all";
            changeActiveView(targetView);
        },
        [changeActiveView],
    );

    return (
        <div className={b()}>
            <div className={e("tabs")}>
                <Tabs tabs={tabs} selectedTabId={activeTabId} onTabSelect={onTabSelect} />
            </div>
            <div className={e("mark-all-as-read-button")}>
                <UiButton
                    variant="popout"
                    size="small"
                    label={intl.formatMessage(messages.markAllAsRead)}
                    onClick={markAllNotificationsAsRead}
                    isDisabled={!hasUnreadNotifications}
                />
            </div>
        </div>
    );
}

function getTabs(unreadNotificationsCount: number = 0): ITab[] {
    return [
        { id: messages.tabUnread.id, values: { count: unreadNotificationsCount } },
        { id: messages.tabAll.id },
    ];
}

const messages = defineMessages({
    tabUnread: {
        id: "notifications.panel.tab.unread",
    },
    tabAll: {
        id: "notifications.panel.tab.all",
    },
    markAllAsRead: {
        id: "notifications.panel.markAllAsRead",
    },
});
