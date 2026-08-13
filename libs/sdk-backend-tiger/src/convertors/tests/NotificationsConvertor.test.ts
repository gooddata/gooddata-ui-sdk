// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type AutomationNotification, type AutomationWebhookMessageData } from "@gooddata/api-client-tiger";
import { isAlertNotification } from "@gooddata/sdk-model";

import { convertNotificationFromBackend } from "../fromBackend/NotificationsConvertor.js";

function alertNotification(overrides: Partial<AutomationWebhookMessageData> = {}): AutomationNotification {
    return {
        id: "notification-id",
        workspaceId: "workspace-id",
        automationId: "automation-id",
        isRead: false,
        createdAt: "2026-01-01T00:00:00.000Z",
        data: {
            type: "AUTOMATION",
            content: {
                type: "automation-task.completed",
                timestamp: "2026-01-01T00:00:00.000Z",
                data: {
                    automation: {
                        id: "automation-id",
                        dashboardURL: "https://example.com/dashboard",
                        isCustomDashboardURL: false,
                    },
                    alert: {
                        metric: "Revenue",
                        condition: "GREATER_THAN",
                        status: "SUCCESS",
                    },
                    filters: [{ title: "Region", filter: "Region = EMEA" }],
                    ...overrides,
                },
            },
        },
    };
}

describe("NotificationsConvertor", () => {
    it("should convert alert notification with both filters and parameters", () => {
        const result = convertNotificationFromBackend(
            alertNotification({
                parameters: [
                    { id: "parameter-id", title: "Currency", value: "EUR" },
                    { id: "parameter-id-2", value: "USD" },
                ],
            }),
        );

        expect(result.notificationType).toBe("alertNotification");
        if (!isAlertNotification(result)) {
            throw new Error("Expected an alert notification");
        }
        expect(result.details.data.filters).toEqual([{ title: "Region", filter: "Region = EMEA" }]);
        expect(result.details.data.parameters).toEqual([
            { id: "parameter-id", title: "Currency", value: "EUR" },
            { id: "parameter-id-2", value: "USD" },
        ]);
    });

    it("should convert alert notification without parameters", () => {
        const result = convertNotificationFromBackend(alertNotification());
        if (!isAlertNotification(result)) {
            throw new Error("Expected an alert notification");
        }

        expect(result.details.data.filters).toEqual([{ title: "Region", filter: "Region = EMEA" }]);
        expect(result.details.data.parameters).toBeUndefined();
    });
});
