// (C) 2025-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type INotification } from "@gooddata/sdk-model";

import { getDashboardUrl } from "../dashboardUrl.js";

const DEFAULTS: INotification = {
    notificationType: "scheduleNotification",
    type: "notification",
    id: "1",
    createdAt: "2022-01-01",
    isRead: false,
    details: {
        webhookMessageType: "automation-task.completed",
        data: {
            automation: {
                isCustomDashboardURL: false,
                dashboardURL: "https://example.com",
                id: "1",
                title: "Title",
            },
        },
        timestamp: "2022-01-01",
    },
};

describe("getDashboardUrl", () => {
    it("result for scheduleNotification type", () => {
        const res = getDashboardUrl({
            ...DEFAULTS,
            notificationType: "scheduleNotification",
        });
        expect(res).toEqual(null);
    });

    it("result for alertNotification type, default setting", () => {
        const res = getDashboardUrl({
            ...DEFAULTS,
            notificationType: "alertNotification",
            details: {
                ...DEFAULTS.details,
                data: {
                    ...DEFAULTS.details.data,
                    alert: {} as any,
                },
            },
        });
        expect(res).toEqual("https://example.com");
    });

    it("result for alertNotification type, default setting with automationId", () => {
        const res = getDashboardUrl({
            ...DEFAULTS,
            notificationType: "alertNotification",
            details: {
                ...DEFAULTS.details,
                data: {
                    ...DEFAULTS.details.data,
                    alert: {} as any,
                },
            },
            automationId: "aid1",
        });
        expect(res).toEqual("https://example.com/?automationId=aid1");
    });

    it("result for alertNotification type, default setting with automationId and useAsOfDateParams", () => {
        const res = getDashboardUrl(
            {
                ...DEFAULTS,
                notificationType: "alertNotification",
                details: {
                    ...DEFAULTS.details,
                    data: {
                        ...DEFAULTS.details.data,
                        alert: {} as any,
                    },
                },
                automationId: "aid1",
            },
            true,
        );
        expect(res).toEqual("https://example.com/?automationId=aid1&asOfDate=2022-01-01");
    });

    it("result for alertNotification type, default setting with automationId and useAsOfDateParams on url with hash", () => {
        const res = getDashboardUrl(
            {
                ...DEFAULTS,
                notificationType: "alertNotification",
                details: {
                    ...DEFAULTS.details,
                    data: {
                        ...DEFAULTS.details.data,
                        automation: {
                            ...DEFAULTS.details.data.automation,
                            dashboardURL:
                                "https://checklist.staging.stg11.panther.intgdc.com/dashboards/#/workspace/0649dcfc289b431783607ac590ca8baa/dashboard/954d0f72-25ca-48d2-afc4-00b94c86b32c?test=1",
                        },
                        alert: {} as any,
                    },
                },
                automationId: "aid1",
            },
            true,
        );
        expect(res).toEqual(
            "https://checklist.staging.stg11.panther.intgdc.com/dashboards/#/workspace/0649dcfc289b431783607ac590ca8baa/dashboard/954d0f72-25ca-48d2-afc4-00b94c86b32c?test=1&automationId=aid1&asOfDate=2022-01-01",
        );
    });

    it("result for alertNotification type, custom url setting", () => {
        const res = getDashboardUrl({
            ...DEFAULTS,
            notificationType: "alertNotification",
            details: {
                ...DEFAULTS.details,
                data: {
                    ...DEFAULTS.details.data,
                    alert: {} as any,
                    automation: {
                        ...DEFAULTS.details.data.automation,
                        isCustomDashboardURL: true,
                        dashboardURL: "https://custom.com",
                    },
                },
            },
        });
        expect(res).toEqual("https://custom.com");
    });

    it("result for alertNotification type, custom url setting with automationId", () => {
        const res = getDashboardUrl({
            ...DEFAULTS,
            notificationType: "alertNotification",
            details: {
                ...DEFAULTS.details,
                data: {
                    ...DEFAULTS.details.data,
                    alert: {} as any,
                    automation: {
                        ...DEFAULTS.details.data.automation,
                        isCustomDashboardURL: true,
                        dashboardURL: "https://custom.com",
                    },
                },
            },
            automationId: "aid1",
        });
        expect(res).toEqual("https://custom.com");
    });
});
