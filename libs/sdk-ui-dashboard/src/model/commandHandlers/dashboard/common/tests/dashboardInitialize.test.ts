// (C) 2024-2025 GoodData Corporation

import { describe, it, expect, vi } from "vitest";
import { dummyBackend } from "@gooddata/sdk-backend-base";

import { dashboardInitialize } from "../dashboardInitialize.js";
import { DashboardContext } from "../../../../types/commonTypes.js";

vi.mock("../../../widgets/common/loadInsight.js", () => ({
    loadInsight: async (_ctx: DashboardContext, ref: any) => {
        return {
            insight: {
                ref,
                title: "Test",
                buckets: [],
            },
        };
    },
}));

describe("adhocDashboard", () => {
    const ctx: DashboardContext = {
        backend: dummyBackend(),
        dashboardRef: undefined,
        clientId: "client",
        workspace: "workspace",
        filterContextRef: undefined,
        config: {
            initialContent: [],
        },
    };

    it("should build adhoc dashboard as empty", async () => {
        const data = await dashboardInitialize(ctx, []);
        expect(data).toMatchSnapshot();
    });

    it("should build adhoc dashboard with one insight", async () => {
        const data = await dashboardInitialize(ctx, [
            {
                visualization: {
                    identifier: "test",
                    type: "insight",
                },
            },
        ]);
        expect(data).toMatchSnapshot();
    });

    it("should build adhoc dashboard with one insight content", async () => {
        const data = await dashboardInitialize(ctx, [
            {
                visualizationContent: {
                    insight: {
                        identifier: "test",
                        title: "Test",
                        buckets: [],
                        ref: {
                            identifier: "test",
                            type: "insight",
                        },
                        uri: "/uri",
                        filters: [],
                        sorts: [],
                        properties: {},
                        visualizationUrl: "/url",
                    },
                },
            },
        ]);
        expect(data).toMatchSnapshot();
    });
});
