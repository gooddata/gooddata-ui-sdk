// (C) 2022-2024 GoodData Corporation

import { describe, it, expect } from "vitest";

import { convertNotificationChannelToBackend } from "../toBackend/NotificationChannelsConvertor.js";
import { convertNotificationChannelFromBackend } from "../fromBackend/NotificationChannelsConvertor.js";

describe("NotificationChannelsConvertor", () => {
    it("should convert webhook to notification channel", () => {
        const data = convertNotificationChannelToBackend({
            id: "id",
            type: "notificationChannel",
            destinationType: "webhook",
            title: "name",
            destinationConfig: {
                token: "token",
                endpoint: "endpoint",
            },
            customDashboardUrl: "dashboardUrl",
        });

        expect(data).toEqual({
            attributes: {
                name: "name",
                destinationType: "WEBHOOK",
                destination: {
                    type: "WEBHOOK",
                    token: "token",
                    url: "endpoint",
                },
                customDashboardUrl: "dashboardUrl",
            },
            id: "id",
            type: "notificationChannel",
        });
    });

    it("should convert webhook from notification channel", () => {
        const data = convertNotificationChannelFromBackend({
            id: "id",
            type: "notificationChannel",
            attributes: {
                name: "name",
                description: "description",
                destinationType: "WEBHOOK",
                destination: {
                    type: "WEBHOOK",
                    url: "endpoint",
                    token: "token",
                    hasToken: true,
                },
                allowedRecipients: "CREATOR",
                customDashboardUrl: "dashboardUrl",
            },
        });

        expect(data).toEqual({
            id: "id",
            type: "notificationChannel",
            destinationType: "webhook",
            title: "name",
            description: "description",
            destinationConfig: {
                endpoint: "endpoint",
                token: "token",
                hasToken: true,
            },
            customDashboardUrl: "dashboardUrl",
            tags: [],
            allowedRecipients: "creator",
        });
    });
});
