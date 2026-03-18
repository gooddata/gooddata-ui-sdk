// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-base";
import { type ISettings, idRef } from "@gooddata/sdk-model";

import { type DashboardContext } from "../../../../types/commonTypes.js";
import { loadFilterViews } from "../../initializeDashboardHandler/loadFilterViews.js";
import { loadNotificationChannelsCount } from "../loadNotificationChannelsCount.js";
import { loadWorkspaceAutomationsCount } from "../loadWorkspaceAutomationsCount.js";

function createCtx(config: DashboardContext["config"] = {}): DashboardContext {
    return {
        backend: dummyBackend(),
        workspace: "workspace",
        dashboardRef: idRef("dashboard"),
        filterContextRef: undefined,
        config,
    };
}

const enabledSettings: ISettings = {
    enableScheduling: true,
    enableAlerting: true,
};

describe("export mode skips non-essential calls", () => {
    describe("loadWorkspaceAutomationsCount", () => {
        it("should return 0 when isExport is true", async () => {
            const ctx = createCtx({ isExport: true });
            const result = await loadWorkspaceAutomationsCount(ctx, enabledSettings);
            expect(result).toBe(0);
        });

        it("should return 0 when isReadOnly is true", async () => {
            const ctx = createCtx({ isReadOnly: true });
            const result = await loadWorkspaceAutomationsCount(ctx, enabledSettings);
            expect(result).toBe(0);
        });

        it("should return 0 when scheduling and alerting are disabled", async () => {
            const ctx = createCtx({});
            const result = await loadWorkspaceAutomationsCount(ctx, {});
            expect(result).toBe(0);
        });
    });

    describe("loadNotificationChannelsCount", () => {
        it("should return 0 when isExport is true", async () => {
            const ctx = createCtx({ isExport: true });
            const result = await loadNotificationChannelsCount(ctx, enabledSettings);
            expect(result).toBe(0);
        });

        it("should return 0 when isReadOnly is true", async () => {
            const ctx = createCtx({ isReadOnly: true });
            const result = await loadNotificationChannelsCount(ctx, enabledSettings);
            expect(result).toBe(0);
        });

        it("should return 0 when scheduling and alerting are disabled", async () => {
            const ctx = createCtx({});
            const result = await loadNotificationChannelsCount(ctx, {});
            expect(result).toBe(0);
        });
    });

    describe("loadFilterViews", () => {
        it("should return empty array when isExport is true", async () => {
            const ctx = createCtx({ isExport: true });
            const result = await loadFilterViews(ctx);
            expect(result).toEqual([]);
        });

        it("should return empty array when isReadOnly is true", async () => {
            const ctx = createCtx({ isReadOnly: true });
            const result = await loadFilterViews(ctx);
            expect(result).toEqual([]);
        });

        it("should return empty array when dashboardRef is missing", async () => {
            const ctx = createCtx({});
            ctx.dashboardRef = undefined;
            const result = await loadFilterViews(ctx);
            expect(result).toEqual([]);
        });
    });
});
