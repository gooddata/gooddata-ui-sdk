// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IScheduleNotification } from "@gooddata/sdk-model";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import { IntlWrapper } from "../localization/IntlWrapper.js";

import { Notification } from "./Notification.js";

// No fileUri, so activating the notification marks it as read without starting a real download.
const scheduleNotification: IScheduleNotification = {
    type: "notification",
    notificationType: "scheduleNotification",
    id: "notification-1",
    isRead: false,
    createdAt: "2026-10-22T10:00:00Z",
    details: {
        timestamp: "2026-10-22T10:00:00Z",
        webhookMessageType: "automation-task.completed",
        data: {
            automation: {
                id: "automation-1",
                title: "Weekly sales",
                dashboardURL: "https://example.com/dashboards/sales",
                dashboardTitle: "Sales",
            },
            tabularExports: [{ fileName: "sales.xlsx", exportId: "export-1", status: "SUCCESS" }],
        },
    },
};

function renderNotification() {
    const markNotificationAsRead = vi.fn();
    render(
        <IntlWrapper locale="en-US">
            <ToastsCenterContextProvider skipAutomaticMessageRendering>
                <Notification
                    notification={scheduleNotification}
                    markNotificationAsRead={markNotificationAsRead}
                    closeNotificationsPanel={vi.fn()}
                />
            </ToastsCenterContextProvider>
        </IntlWrapper>,
    );
    return { markNotificationAsRead };
}

describe("Notification", () => {
    it("activates the notification itself with Enter", () => {
        const { markNotificationAsRead } = renderNotification();

        fireEvent.keyDown(screen.getByRole("listitem"), { key: "Enter", code: "Enter" });

        expect(markNotificationAsRead).toHaveBeenCalledWith("notification-1");
    });

    it("leaves Enter on the dashboard link to the link instead of activating the notification", () => {
        const { markNotificationAsRead } = renderNotification();

        const notPrevented = fireEvent.keyDown(screen.getByRole("link", { name: /Sales/ }), {
            key: "Enter",
            code: "Enter",
        });

        expect(notPrevented).toBe(true);
        expect(markNotificationAsRead).not.toHaveBeenCalled();
    });

    it("leaves a click on the dashboard link to the link instead of activating the notification", () => {
        const { markNotificationAsRead } = renderNotification();
        const dashboardLink = screen.getByRole("link", { name: /Sales/ });
        // Keeps happy-dom from navigating the window that later test files in this worker share.
        dashboardLink.addEventListener("click", (event) => event.preventDefault());

        fireEvent.click(dashboardLink);

        expect(markNotificationAsRead).not.toHaveBeenCalled();
    });
});
