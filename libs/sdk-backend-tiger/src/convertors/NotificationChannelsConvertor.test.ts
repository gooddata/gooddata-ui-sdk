// (C) 2022-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { convertNotificationChannelFromBackend } from "./fromBackend/NotificationChannelsConvertor.js";
import { convertNotificationChannelToBackend } from "./toBackend/NotificationChannelsConvertor.js";

describe("NotificationChannelsConvertor", () => {
    it("should convert webhook to notification channel", () => {
        const data = convertNotificationChannelToBackend({
            id: "id",
            type: "notificationChannel",
            destinationType: "webhook",
            title: "name",
            sendInPlatformNotifications: false,
            destinationConfig: {
                token: "token",
                secretKey: "secret",
                endpoint: "endpoint",
            },
            customDashboardUrl: "dashboardUrl",
        });

        expect(data).toEqual({
            attributes: {
                name: "name",
                inPlatformNotification: "DISABLED",
                destination: {
                    type: "WEBHOOK",
                    token: "token",
                    secretKey: "secret",
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
                inPlatformNotification: "ENABLED",
                destination: {
                    type: "WEBHOOK",
                    url: "endpoint",
                    token: "token",
                    hasToken: true,
                    hasSecretKey: true,
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
            sendInPlatformNotifications: true,
            destinationConfig: {
                endpoint: "endpoint",
                token: "token",
                hasToken: true,
                hasSecretKey: true,
            },
            customDashboardUrl: "dashboardUrl",
            tags: [],
            allowedRecipients: "creator",
        });
    });
    it("normalizes nullable signing fields from backend", () => {
        const data = convertNotificationChannelFromBackend({
            id: "id",
            type: "notificationChannel",
            attributes: {
                destinationType: "WEBHOOK",
                destination: { type: "WEBHOOK", secretKey: null, hasSecretKey: null },
            },
        });
        expect(data).toEqual(
            expect.objectContaining({
                destinationConfig: expect.objectContaining({ secretKey: undefined, hasSecretKey: undefined }),
            }),
        );
    });
});
