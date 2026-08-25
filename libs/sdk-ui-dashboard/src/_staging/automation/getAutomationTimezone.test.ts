// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type IAutomationMetadataObject } from "@gooddata/sdk-model";

import { getAutomationTimezone } from "./index.js";

function alertAutomation(timezone?: string): IAutomationMetadataObject {
    return {
        type: "automation",
        id: "alert-1",
        title: "alert",
        description: "",
        uri: "alert-1",
        ref: { identifier: "alert-1" },
        production: true,
        deprecated: false,
        unlisted: false,
        alert: {
            condition: {
                type: "comparison",
                operator: "GREATER_THAN",
                left: { id: "m_amt" },
                right: 1,
            },
            execution: {
                attributes: [],
                measures: [],
                filters: [],
                ...(timezone ? { executionConfig: { timezone } } : {}),
            },
            trigger: { state: "ACTIVE" },
        },
    } as IAutomationMetadataObject;
}

function scheduleAutomation(timezoneId?: string): IAutomationMetadataObject {
    return {
        type: "automation",
        id: "schedule-1",
        title: "schedule",
        description: "",
        uri: "schedule-1",
        ref: { identifier: "schedule-1" },
        production: true,
        deprecated: false,
        unlisted: false,
        exportDefinitions: [
            {
                type: "exportDefinition",
                id: "export-1",
                title: "export",
                description: "",
                uri: "export-1",
                ref: { identifier: "export-1" },
                production: true,
                deprecated: false,
                unlisted: false,
                requestPayload: {
                    type: "dashboard",
                    fileName: "dashboard",
                    format: "PDF",
                    content: { dashboard: "dash-1" },
                    ...(timezoneId ? { timezoneId } : {}),
                },
            },
        ],
    } as IAutomationMetadataObject;
}

describe("getAutomationTimezone", () => {
    it("reads the timezone baked into an alert execution config", () => {
        expect(getAutomationTimezone(alertAutomation("Europe/Prague"))).toBe("Europe/Prague");
    });

    it("reads the timezone baked into a schedule export definition", () => {
        expect(getAutomationTimezone(scheduleAutomation("America/New_York"))).toBe("America/New_York");
    });

    it("returns undefined when the automation bakes no timezone", () => {
        expect(getAutomationTimezone(alertAutomation())).toBeUndefined();
        expect(getAutomationTimezone(scheduleAutomation())).toBeUndefined();
    });

    it("returns undefined for no automation", () => {
        expect(getAutomationTimezone(undefined)).toBeUndefined();
    });
});
