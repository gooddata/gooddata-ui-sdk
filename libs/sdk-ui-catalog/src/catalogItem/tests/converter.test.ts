// (C) 2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { IMeasureMetadataObject, MetricType } from "@gooddata/sdk-model";

import { convertMeasureToCatalogItem } from "../converter.js";

function createMeasure(overrides: Partial<IMeasureMetadataObject> = {}): IMeasureMetadataObject {
    const base: IMeasureMetadataObject = {
        id: "metric.id",
        uri: "/gdc/md/metric.id",
        type: "measure",
        unlisted: false,
        ref: { identifier: "metric.id", type: "measure" },
        title: "Revenue",
        description: "Total revenue",
        expression: "SELECT 1",
        format: "#,##0.00",
        tags: ["finance"],
        production: true,
        created: "2024-01-01",
        updated: "2024-01-02",
        isLocked: false,
        isHidden: false,
        deprecated: false,
        metricType: "CURRENCY" as MetricType,
    };

    return {
        ...base,
        ...overrides,
    };
}

describe("convertMeasureToCatalogItem", () => {
    it("should include metric type and format for measures", () => {
        const catalogItem = convertMeasureToCatalogItem(createMeasure());

        expect(catalogItem.metricType).toBe("CURRENCY");
        expect(catalogItem.format).toBe("#,##0.00");
    });

    it("should normalize missing format to null", () => {
        const catalogItem = convertMeasureToCatalogItem(createMeasure({ format: "" }));

        expect(catalogItem.format).toBeNull();
    });
});
