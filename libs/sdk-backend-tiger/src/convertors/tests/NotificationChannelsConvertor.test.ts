// (C) 2022-2024 GoodData Corporation

import { describe, it, expect } from "vitest";

import { convertWebhookToNotificationChannel } from "../toBackend/NotificationChannelsConvertor.js";
import { convertWebhookFromNotificationChannel } from "../fromBackend/NotificationChannelsConvertor.js";

describe("NotificationChannelsConvertor", () => {
    it("should convert webhook to notification channel", () => {
        const data = convertWebhookToNotificationChannel({
            id: "id",
            name: "name",
            token: "token",
            endpoint: "endpoint",
            triggers: [
                {
                    type: "SCHEDULE",
                    allowOn: ["dashboard", "visualization"],
                },
                {
                    type: "ALERT",
                },
            ],
        });

        expect(data).toEqual({
            attributes: {
                name: "name",
                triggers: [
                    {
                        metadata: {
                            allowedOn: ["dashboard", "visualization"],
                        },
                        type: "SCHEDULE",
                    },
                    {
                        type: "ALERT",
                    },
                ],
                webhook: {
                    token: "token",
                    url: "endpoint",
                },
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
                webhook: {
                    url: "endpoint",
                    token: "token",
                    hasToken: true,
                },
                triggers: [
                    {
                        type: "SCHEDULE",
                        metadata: {
                            allowedOn: ["dashboard", "visualization"],
                        },
                    },
                    {
                        type: "ALERT",
                    },
                ],
            },
        });

        expect(data).toEqual({
            id: "id",
            name: "name",
            endpoint: "endpoint",
            token: "token",
            hasToken: true,
            triggers: [
                {
                    allowOn: ["dashboard", "visualization"],
                    type: "SCHEDULE",
                },
                {
                    type: "ALERT",
                },
            ],
        });
    });
});
