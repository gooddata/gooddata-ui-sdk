// (C) 2026 GoodData Corporation

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { IntlWrapper } from "../localization/IntlWrapper.js";

import { DefaultNotificationsPanel } from "./DefaultNotificationsPanel.js";
import { DefaultNotificationsPanelHeader } from "./DefaultNotificationsPanelHeader.js";

function Empty() {
    return null;
}

describe("DefaultNotificationsPanel", () => {
    it("should name the panel so screen readers announce it when focus enters the tabs", () => {
        render(
            <IntlWrapper locale="en-US">
                <DefaultNotificationsPanel
                    NotificationsPanelHeader={DefaultNotificationsPanelHeader}
                    NotificationsList={Empty}
                    NotificationsListEmptyState={Empty}
                    NotificationsListErrorState={Empty}
                    Notification={Empty}
                    NotificationSkeletonItem={Empty}
                    toggleNotificationsPanel={vi.fn()}
                    openNotificationsPanel={vi.fn()}
                    closeNotificationsPanel={vi.fn()}
                    activeView="unread"
                    changeActiveView={vi.fn()}
                    markNotificationAsRead={vi.fn()}
                    markAllNotificationsAsRead={vi.fn()}
                    unreadNotificationsCount={0}
                    hasUnreadNotifications={false}
                    activeNotifications={[]}
                    status="success"
                    loadNextPage={vi.fn()}
                    hasNextPage={false}
                    itemHeight={52}
                    itemsGap={10}
                    itemPadding={15}
                    skeletonItemsCount={5}
                />
            </IntlWrapper>,
        );

        const panel = screen.getByRole("region", { name: "Notifications" });
        expect(within(panel).getByRole("tablist")).toBeInTheDocument();
        expect(within(panel).getByRole("tab", { selected: true })).toHaveTextContent("Unread");
    });
});
