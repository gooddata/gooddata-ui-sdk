// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { IMeasureMetadataObject } from "@gooddata/sdk-model";

import { createMetricMutationAdapter } from "../metricMutationPort.js";

import { createTestMetricMutationPort } from "./metricMutationPort.test.utils.js";

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
        );
        expect(result).toMatchObject({ type: "measure", identifier: "revenue.total", format: "#,##0.00" });
    });

    it("update overlays the YAML-owned fields onto the loaded measure", async () => {
        const { backend, updateMeasure } = createFakeBackend();
        const adapter = createMetricMutationAdapter(backend, "ws-1");

        await adapter.update(savedMeasure, {
            type: "measure",
            title: "Renamed",
            description: "Updated",
            tags: ["updated"],
            expression: "SELECT COUNT({fact/order_id})",
            format: "0.0",
        });

        expect(updateMeasure).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "measure",
                id: "revenue.total",
                ref: { identifier: "revenue.total", type: "measure" },
                title: "Renamed",
                expression: "SELECT COUNT({fact/order_id})",
                format: "0.0",
            }),
        );
    });

    it("update preserves metric fields the YAML does not carry", async () => {
        const { backend, updateMeasure } = createFakeBackend();
        const adapter = createMetricMutationAdapter(backend, "ws-1");

        const existing: IMeasureMetadataObject = {
            ...savedMeasure,
            metricType: "CURRENCY",
            isHiddenFromKda: true,
        };

        await adapter.update(existing, {
            type: "measure",
            title: "Total Revenue",
            description: "Sum",
            tags: ["finance"],
            expression: "SELECT SUM({fact/order_amount})",
            format: "#,##0.00",
        });

        expect(updateMeasure).toHaveBeenCalledWith(
            expect.objectContaining({ metricType: "CURRENCY", isHiddenFromKda: true }),
        );
    });

    it("makes a previously hidden metric visible when the definition carries no isHidden", async () => {
        const { backend, updateMeasure } = createFakeBackend();
        const adapter = createMetricMutationAdapter(backend, "ws-1");
        const hiddenExisting: IMeasureMetadataObject = { ...savedMeasure, isHidden: true };

        await adapter.update(hiddenExisting, {
            type: "measure",
            title: "Total Revenue",
            description: "Sum",
            tags: ["finance"],
            expression: "SELECT SUM({fact/order_amount})",
            format: "#,##0.00",
        });

        expect(updateMeasure).toHaveBeenCalledWith(expect.objectContaining({ isHidden: false }));
    });

    it("delete calls backend deleteMeasure with the measure ref", async () => {
        const { backend, deleteMeasure } = createFakeBackend();
        const adapter = createMetricMutationAdapter(backend, "ws-1");

        await adapter.delete({ identifier: "revenue.total", type: "measure" });

        expect(deleteMeasure).toHaveBeenCalledWith(
            expect.objectContaining({ identifier: "revenue.total", type: "measure" }),
        );
    });

    it("load fetches the full measure by ref", async () => {
        const { backend, getMeasure } = createFakeBackend();
        const adapter = createMetricMutationAdapter(backend, "ws-1");

        const measure = await adapter.load({ identifier: "revenue.total", type: "measure" });

        expect(getMeasure).toHaveBeenCalledWith(
            expect.objectContaining({ identifier: "revenue.total", type: "measure" }),
        );
        expect(measure).toMatchObject({ id: "revenue.total", expression: "SELECT SUM({fact/order_amount})" });
    });

    it("getReferencingObjects queries the backend", async () => {
        const { backend, getMeasureReferencingObjects } = createFakeBackend();
        const adapter = createMetricMutationAdapter(backend, "ws-1");

        const referencing = await adapter.getReferencingObjects({
            identifier: "revenue.total",
            type: "measure",
        });

        expect(getMeasureReferencingObjects).toHaveBeenCalled();
        expect(referencing).toEqual({ insights: [], measures: [] });
    });

    it("createTestMetricMutationPort returns vi.fn() stubs", async () => {
        const port = createTestMetricMutationPort();
        expect(vi.isMockFunction(port.create)).toBe(true);
        expect(vi.isMockFunction(port.load)).toBe(true);
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
