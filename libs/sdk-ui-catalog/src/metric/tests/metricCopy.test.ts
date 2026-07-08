// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { IMeasureMetadataObjectDefinition } from "@gooddata/sdk-model";

import { createCopiedMetric } from "../metricCopy.js";

const base: IMeasureMetadataObjectDefinition = {
    type: "measure",
    id: "revenue_total",
    title: "Total Revenue",
    description: "Sum",
    tags: ["finance"],
    expression: "SELECT SUM({fact/order_amount})",
    format: "#,##0.00",
};

describe("createCopiedMetric", () => {
    it("appends a copy suffix to the title and derives an id from it", () => {
        expect(createCopiedMetric(base)).toMatchObject({
            id: "total_revenue__2_",
            title: "Total Revenue (2)",
            expression: "SELECT SUM({fact/order_amount})",
            format: "#,##0.00",
        });
    });

    it("increments an existing copy suffix", () => {
        expect(createCopiedMetric({ ...base, title: "Total Revenue (2)" })).toMatchObject({
            title: "Total Revenue (3)",
        });
    });

    it("omits the id when the source id is a canonical uuid", () => {
        const copy = createCopiedMetric({
            ...base,
            id: "b8f1e2c4-1a2b-4c3d-9e8f-0a1b2c3d4e5f",
        });
        expect(copy).not.toHaveProperty("id");
    });

    it("preserves the definition body", () => {
        const copy = createCopiedMetric(base);
        expect(copy.expression).toBe(base.expression);
        expect(copy.tags).toEqual(base.tags);
    });

    it("preserves the metric type so a currency metric copies as a currency metric", () => {
        const copy = createCopiedMetric({ ...base, metricType: "CURRENCY" });
        expect(copy.metricType).toBe("CURRENCY");
    });

    it("preserves the hidden-from-key-driver-analysis flag", () => {
        const copy = createCopiedMetric({ ...base, isHiddenFromKda: true });
        expect(copy.isHiddenFromKda).toBe(true);
    });

    it("does not carry the lock so the copy is editable rather than inheriting a governance lock", () => {
        const copy = createCopiedMetric({ ...base, isLocked: true });
        expect(copy).not.toHaveProperty("isLocked");
    });

    it("excludes server-managed fields carried by a loaded measure", () => {
        const loadedMeasure = {
            ...base,
            uri: "/measures/revenue_total",
            ref: { identifier: "revenue_total", type: "measure" },
            production: true,
            created: "2024-01-01",
        } as IMeasureMetadataObjectDefinition;
        const copy = createCopiedMetric(loadedMeasure);
        expect(copy).not.toHaveProperty("uri");
        expect(copy).not.toHaveProperty("ref");
        expect(copy).not.toHaveProperty("production");
        expect(copy).not.toHaveProperty("created");
    });
});
