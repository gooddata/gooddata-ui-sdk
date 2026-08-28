// (C) 2026 GoodData Corporation

// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

import { type IUnavailableDashboardReference } from "@gooddata/sdk-backend-spi";
import { type IDashboard, idRef } from "@gooddata/sdk-model";

import { type DashboardContext } from "../../../types/commonTypes.js";

import { dashboardLoadReferenceTypes, loadUnavailableReferences } from "./loadUnavailableReferences.js";

const dashboard = { ref: idRef("dash", "analyticalDashboard") } as IDashboard;
const forbiddenInsight: IUnavailableDashboardReference = {
    ref: idRef("i1", "insight"),
    type: "insight",
    reason: "forbidden",
};
const forbiddenLabel: IUnavailableDashboardReference = {
    ref: idRef("l1", "displayForm"),
    type: "displayForm",
    reason: "forbidden",
};

function createContext(
    getDashboardReferencedObjects: ReturnType<typeof vi.fn>,
    settings?: { enableDashboardPartialRendering: boolean },
): DashboardContext {
    return {
        workspace: "ws",
        config: settings ? { settings } : {},
        backend: {
            workspace: () => ({
                dashboards: () => ({ getDashboardReferencedObjects }),
            }),
        },
    } as unknown as DashboardContext;
}

describe("loadUnavailableReferences", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("reports nothing and loads nothing when the feature is off", async () => {
        const load = vi.fn();

        await expect(
            loadUnavailableReferences(createContext(load), dashboard, [forbiddenInsight], false, false),
        ).resolves.toEqual([]);
        expect(load).not.toHaveBeenCalled();
    });

    it("adds display form and drill target availability to the base result", async () => {
        const load = vi.fn().mockResolvedValue({ insights: [], plugins: [], unavailable: [forbiddenLabel] });

        await expect(
            loadUnavailableReferences(createContext(load), dashboard, [forbiddenInsight], true, false),
        ).resolves.toEqual([forbiddenInsight, forbiddenLabel]);
        expect(load).toHaveBeenCalledWith(dashboard, ["displayForm", "analyticalDashboard"]);
    });

    it("keeps the caller-provided availability of a persisted dashboard without asking the backend", async () => {
        const load = vi.fn();

        await expect(
            loadUnavailableReferences(createContext(load), dashboard, [forbiddenInsight], true, true),
        ).resolves.toEqual([forbiddenInsight]);
        expect(load).not.toHaveBeenCalled();
    });

    it("keeps the base result when the extra request fails", async () => {
        vi.spyOn(console, "warn").mockImplementation(() => {});
        const load = vi.fn().mockRejectedValue(new Error("500"));

        await expect(
            loadUnavailableReferences(createContext(load), dashboard, [forbiddenInsight], true, false),
        ).resolves.toEqual([forbiddenInsight]);
    });

    it("does not request again when the switch was known up front and the load already covered everything", async () => {
        const load = vi.fn();
        const ctx = createContext(load, { enableDashboardPartialRendering: true });

        await expect(
            loadUnavailableReferences(ctx, dashboard, [forbiddenInsight], true, false),
        ).resolves.toEqual([forbiddenInsight]);
        expect(load).not.toHaveBeenCalled();
    });
});

describe("dashboardLoadReferenceTypes", () => {
    it("requests only insights and datasets unless the host settings turn partial rendering on", () => {
        expect(dashboardLoadReferenceTypes(createContext(vi.fn()))).toEqual(["insight", "dataSet"]);
        expect(
            dashboardLoadReferenceTypes(createContext(vi.fn(), { enableDashboardPartialRendering: false })),
        ).toEqual(["insight", "dataSet"]);
        expect(
            dashboardLoadReferenceTypes(createContext(vi.fn(), { enableDashboardPartialRendering: true })),
        ).toEqual(["insight", "dataSet", "displayForm", "analyticalDashboard"]);
    });
});
