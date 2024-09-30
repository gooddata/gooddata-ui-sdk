// (C) 2022-2024 GoodData Corporation

import { describe, it, expect } from "vitest";

import { convertWebhookToNotificationChannel } from "../toBackend/NotificationChannelsConvertor.js";
import { convertWebhookFromNotificationChannel } from "../fromBackend/NotificationChannelsConvertor.js";

describe("NotificationChannelsConvertor", () => {
    it("should convert webhook to notification channel", () => {
        const data = convertWebhookToNotificationChannel({
            id: "id",
            type: "webhook",
            destination: {
                name: "name",
                token: "token",
                endpoint: "endpoint",
            },
            configuration: {
                dashboardUrl: "dashboardUrl",
            },
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
        const data = convertWebhookFromNotificationChannel({
            id: "id",
            attributes: {
                name: "name",
                destinationType: "WEBHOOK",
                destination: {
                    type: "WEBHOOK",
                    url: "endpoint",
                    token: "token",
                    hasToken: true,
                },
            },
        });

        expect(data).toEqual({
            id: "id",
            type: "webhook",
            destination: {
                name: "name",
                endpoint: "endpoint",
                token: "token",
                hasToken: true,
            },
            configuration: {
                dashboardUrl: undefined,
            },
        });
    });
});
