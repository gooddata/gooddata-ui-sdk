// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type JsonApiAnalyticalDashboardOut } from "@gooddata/api-client-tiger";

import { convertAnalyticalDashboard } from "../AnalyticalDashboardConverter.js";

describe("convertAnalyticalDashboard", () => {
    it("should map attributes.summary into listed dashboard summary", () => {
        const input: JsonApiAnalyticalDashboardOut = {
            id: "dashboardId",
            type: "analyticalDashboard",
            attributes: {
                title: "Title",
                description: "Description",
                createdAt: "2026-01-01T00:00:00.000Z",
                modifiedAt: "2026-01-02T00:00:00.000Z",
                tags: [],
                content: {},
                summary: "AI summary text",
            },
            meta: {},
            relationships: {},
        } as unknown as JsonApiAnalyticalDashboardOut;

        const result = convertAnalyticalDashboard(input);

        expect(result.summary).toBe("AI summary text");
    });
});
