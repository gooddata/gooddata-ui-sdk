// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { IInsight, IInsightDefinition } from "@gooddata/sdk-model";

import type { ICatalogItemInsight } from "../catalogItem/types.js";

import { countInsightReferences, createInsightMutationAdapter, loadInsight } from "./insightMutationPort.js";

const insightItem = { identifier: "revenue.bar", type: "insight" } as ICatalogItemInsight;

const savedInsight: IInsight = {
    insight: {
        identifier: "revenue.bar",
        uri: "revenue.bar",
        ref: { identifier: "revenue.bar", type: "insight" },
        isLocked: true,
        title: "Revenue by Region",
        summary: "",
        tags: [],
        visualizationUrl: "local:bar",
        buckets: [],
        filters: [],
        sorts: [],
        properties: {},
        attributeFilterConfigs: {
            "filter-1": { displayAsLabel: { identifier: "region.name", type: "displayForm" } },
        },
    },
};

const definition: IInsightDefinition = {
    insight: {
        title: "Revenue by Region",
        visualizationUrl: "local:bar",
        buckets: [],
        filters: [],
        sorts: [],
        properties: {},
    },
};

function createFakeBackend() {
    const createInsight = vi.fn().mockResolvedValue(savedInsight);
    const updateInsight = vi.fn().mockResolvedValue(savedInsight);
    const deleteInsight = vi.fn().mockResolvedValue(undefined);
    const getInsight = vi.fn().mockResolvedValue(savedInsight);
    const getInsightReferencingObjects = vi.fn().mockResolvedValue({ analyticalDashboards: [] });
    const backend = {
        workspace: () => ({
            insights: () => ({
                createInsight,
                updateInsight,
                deleteInsight,
                getInsight,
                getInsightReferencingObjects,
            }),
        }),
    } as unknown as IAnalyticalBackend;
    return { backend, createInsight, updateInsight, deleteInsight, getInsight, getInsightReferencingObjects };
}

describe("insightMutationPort adapter", () => {
    it("create calls backend createInsight and converts the result", async () => {
        const { backend, createInsight } = createFakeBackend();
        const adapter = createInsightMutationAdapter(backend, "ws-1");

        const result = await adapter.create(definition);

        expect(createInsight).toHaveBeenCalledWith(definition);
        expect(result).toMatchObject({
            type: "insight",
            identifier: "revenue.bar",
            visualizationType: "bar",
        });
    });

    it("persists the edited content and re-attaches the loaded insight identity", async () => {
        const { backend, updateInsight } = createFakeBackend();
        const adapter = createInsightMutationAdapter(backend, "ws-1");

        await adapter.update(savedInsight, { insight: { ...definition.insight, title: "Renamed" } });

        const [updated] = updateInsight.mock.calls[0] as [IInsight];
        expect(updated.insight).toMatchObject({
            identifier: "revenue.bar",
            uri: "revenue.bar",
            ref: { identifier: "revenue.bar", type: "insight" },
            isLocked: true,
            title: "Renamed",
        });
    });

    it("drops a representable field the edit cleared rather than restoring the base value", async () => {
        const { backend, updateInsight } = createFakeBackend();
        const adapter = createInsightMutationAdapter(backend, "ws-1");

        await adapter.update(savedInsight, { insight: { ...definition.insight, title: "Renamed" } });

        const [updated] = updateInsight.mock.calls[0] as [IInsight];
        expect(updated.insight).not.toHaveProperty("attributeFilterConfigs");
    });

    it("persists a representable field the edit added", async () => {
        const { backend, updateInsight } = createFakeBackend();
        const adapter = createInsightMutationAdapter(backend, "ws-1");
        const editedConfigs = {
            "filter-2": { displayAsLabel: { identifier: "product.name", type: "displayForm" as const } },
        };

        await adapter.update(savedInsight, {
            insight: { ...definition.insight, attributeFilterConfigs: editedConfigs },
        });

        const [updated] = updateInsight.mock.calls[0] as [IInsight];
        expect(updated.insight.attributeFilterConfigs).toEqual(editedConfigs);
    });

    it("persists the definition's visibility rather than the loaded insight's", async () => {
        const { backend, updateInsight } = createFakeBackend();
        const adapter = createInsightMutationAdapter(backend, "ws-1");
        const hiddenBase: IInsight = { insight: { ...savedInsight.insight, isHidden: true } };

        await adapter.update(hiddenBase, { insight: { ...definition.insight, isHidden: false } });

        const [updated] = updateInsight.mock.calls[0] as [IInsight];
        expect(updated.insight.isHidden).toBe(false);
    });

    it("update throws when the base is a bare definition without identity", async () => {
        const { backend } = createFakeBackend();
        const adapter = createInsightMutationAdapter(backend, "ws-1");

        await expect(adapter.update(definition, definition)).rejects.toThrow();
    });
});

describe("loadInsight", () => {
    it("requests user data so the saved item keeps its authors after update echoes the base", async () => {
        const { backend, getInsight } = createFakeBackend();

        await loadInsight(backend, "ws-1", insightItem);

        expect(getInsight).toHaveBeenCalledWith(
            { identifier: "revenue.bar", type: "insight" },
            { loadUserData: true },
        );
    });
});

describe("insight reference count", () => {
    it("countInsightReferences counts referencing dashboards", async () => {
        const { backend, getInsightReferencingObjects } = createFakeBackend();
        getInsightReferencingObjects.mockResolvedValueOnce({ analyticalDashboards: [{}, {}] });

        expect(await countInsightReferences(backend, "ws-1", insightItem)).toBe(2);
    });

    it("countInsightReferences reports zero when the response carries no dashboard array", async () => {
        const { backend, getInsightReferencingObjects } = createFakeBackend();
        getInsightReferencingObjects.mockResolvedValueOnce({});

        expect(await countInsightReferences(backend, "ws-1", insightItem)).toBe(0);
    });
});
