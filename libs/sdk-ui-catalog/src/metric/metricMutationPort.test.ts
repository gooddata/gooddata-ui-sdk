// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { IMeasureMetadataObject, IMeasureMetadataObjectDefinition } from "@gooddata/sdk-model";

import type { ICatalogItemMeasure } from "../catalogItem/types.js";

import { createMetricMutationAdapter, listMetricReferences } from "./metricMutationPort.js";
import { createTestMetricMutationPort } from "./metricMutationPort.test.utils.js";

const measureItem = { identifier: "revenue.total", type: "measure" } as ICatalogItemMeasure;

const savedMeasure: IMeasureMetadataObject = {
    id: "revenue.total",
    uri: "revenue.total",
    ref: { identifier: "revenue.total", type: "measure" },
    type: "measure",
    title: "Total Revenue",
    description: "Sum",
    tags: ["finance"],
    production: true,
    deprecated: false,
    unlisted: false,
    created: "2024-01-01",
    updated: "2024-01-02",
    expression: "SELECT SUM({fact/order_amount})",
    format: "#,##0.00",
};

function createFakeBackend() {
    const createMeasure = vi.fn().mockResolvedValue(savedMeasure);
    const updateMeasure = vi.fn().mockResolvedValue(savedMeasure);
    const deleteMeasure = vi.fn().mockResolvedValue(undefined);
    const getMeasure = vi.fn().mockResolvedValue(savedMeasure);
    const getMeasureReferencingObjects = vi.fn().mockResolvedValue({ insights: [], measures: [] });
    const backend = {
        workspace: () => ({
            measures: () => ({
                createMeasure,
                updateMeasure,
                deleteMeasure,
                getMeasure,
                getMeasureReferencingObjects,
            }),
        }),
    } as unknown as IAnalyticalBackend;
    return { backend, createMeasure, updateMeasure, deleteMeasure, getMeasure, getMeasureReferencingObjects };
}

describe("metricMutationPort adapter", () => {
    it("create calls backend createMeasure and converts the result", async () => {
        const { backend, createMeasure } = createFakeBackend();
        const adapter = createMetricMutationAdapter(backend, "ws-1");

        const result = await adapter.create({
            type: "measure",
            title: "Total Revenue",
            description: "Sum",
            tags: ["finance"],
            expression: "SELECT SUM({fact/order_amount})",
            format: "#,##0.00",
        });

        expect(createMeasure).toHaveBeenCalledWith(
            expect.objectContaining({ expression: "SELECT SUM({fact/order_amount})", format: "#,##0.00" }),
            { loadPermissions: false },
        );
        expect(result).toMatchObject({ type: "measure", identifier: "revenue.total", format: "#,##0.00" });
    });

    it("create asks for the new metric's permissions when they are enabled", async () => {
        const { backend, createMeasure } = createFakeBackend();
        const adapter = createMetricMutationAdapter(backend, "ws-1", { enableMetricPermissions: true });

        await adapter.create({ type: "measure", title: "Total Revenue", expression: "SELECT 1", format: "" });

        expect(createMeasure).toHaveBeenCalledWith(expect.anything(), { loadPermissions: true });
    });

    it("update persists the definition's content with the loaded measure's identity", async () => {
        const { backend, updateMeasure } = createFakeBackend();
        const adapter = createMetricMutationAdapter(backend, "ws-1");

        await adapter.update(savedMeasure, {
            type: "measure",
            title: "Renamed",
            description: "Updated",
            tags: ["updated"],
            expression: "SELECT COUNT({fact/order_id})",
            format: "0.0",
            metricType: "CURRENCY",
            isHiddenFromKda: true,
            isHidden: false,
        });

        expect(updateMeasure).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "measure",
                id: "revenue.total",
                ref: { identifier: "revenue.total", type: "measure" },
                title: "Renamed",
                expression: "SELECT COUNT({fact/order_id})",
                format: "0.0",
                metricType: "CURRENCY",
                isHiddenFromKda: true,
                isHidden: false,
            }),
        );
    });

    it("update keeps the loaded identity even when the definition carries a different id", async () => {
        const { backend, updateMeasure } = createFakeBackend();
        const adapter = createMetricMutationAdapter(backend, "ws-1");

        await adapter.update(savedMeasure, {
            type: "measure",
            id: "some_other_id",
            title: "X",
            description: "",
            tags: [],
            expression: "SELECT 1",
            format: "",
        });

        expect(updateMeasure).toHaveBeenCalledWith(
            expect.objectContaining({ id: "revenue.total", ref: savedMeasure.ref, uri: savedMeasure.uri }),
        );
    });

    it("update carries the base's fields the definition shape cannot hold (audit metadata)", async () => {
        const { backend, updateMeasure } = createFakeBackend();
        const adapter = createMetricMutationAdapter(backend, "ws-1");

        await adapter.update(savedMeasure, {
            type: "measure",
            title: "Total Revenue",
            description: "Sum",
            tags: ["finance"],
            expression: "SELECT SUM({fact/order_amount})",
            format: "#,##0.00",
        });

        expect(updateMeasure).toHaveBeenCalledWith(
            expect.objectContaining({ created: "2024-01-01", updated: "2024-01-02" }),
        );
    });

    it("update rejects a bare definition as base — it lacks the server-managed identity", async () => {
        const { backend } = createFakeBackend();
        const adapter = createMetricMutationAdapter(backend, "ws-1");
        const bareDefinition: IMeasureMetadataObjectDefinition = {
            type: "measure",
            title: "X",
            description: "",
            tags: [],
            expression: "SELECT 1",
            format: "",
        };

        await expect(adapter.update(bareDefinition, bareDefinition)).rejects.toThrow(
            /requires the loaded measure/,
        );
    });

    it("createTestMetricMutationPort returns vi.fn() stubs", async () => {
        const port = createTestMetricMutationPort();
        expect(vi.isMockFunction(port.create)).toBe(true);
        expect(vi.isMockFunction(port.update)).toBe(true);
        const created = await port.create({
            type: "measure",
            title: "New",
            description: "",
            tags: [],
            expression: "SELECT 1",
            format: "",
        });
        expect(created).toMatchObject({ type: "measure" });
    });
});

describe("metric references", () => {
    it("listMetricReferences titles the referencing insights and measures", async () => {
        const { backend, getMeasureReferencingObjects } = createFakeBackend();
        getMeasureReferencingObjects.mockResolvedValueOnce({
            insights: [{ insight: { title: "Revenue trend" } }, { insight: { title: "Top accounts" } }],
            measures: [{ title: "Revenue per account" }],
        });

        expect(await listMetricReferences(backend, "ws-1", measureItem)).toEqual([
            "Revenue trend",
            "Top accounts",
            "Revenue per account",
        ]);
    });

    it("listMetricReferences reports nothing when the response carries neither array", async () => {
        const { backend, getMeasureReferencingObjects } = createFakeBackend();
        getMeasureReferencingObjects.mockResolvedValueOnce({});

        expect(await listMetricReferences(backend, "ws-1", measureItem)).toEqual([]);
    });
});
