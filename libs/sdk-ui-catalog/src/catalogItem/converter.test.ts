// (C) 2025-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type {
    IComputedAttributeMetadataObject,
    IMeasureMetadataObject,
    IParameterMetadataObject,
    MetricType,
} from "@gooddata/sdk-model";

import {
    convertComputedAttributeToCatalogItem,
    convertMeasureToCatalogItem,
    convertParameterToCatalogItem,
} from "./converter.js";

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

    it("should carry the metric object-level permissions", () => {
        expect(
            convertMeasureToCatalogItem(createMeasure({ permissions: ["VIEW", "EDIT"] })).permissions,
        ).toEqual(["VIEW", "EDIT"]);
    });

    it("should leave the permissions undefined when they were not requested", () => {
        expect(convertMeasureToCatalogItem(createMeasure()).permissions).toBeUndefined();
    });
});

describe("convertParameterToCatalogItem", () => {
    it("should convert parameter audit metadata and keep its definition for editing", () => {
        const parameter: IParameterMetadataObject = {
            id: "parameter.id",
            uri: "/gdc/md/parameter.id",
            ref: { identifier: "parameter.id", type: "parameter" },
            type: "parameter",
            title: "Threshold",
            description: "Alert threshold",
            tags: ["alerts"],
            production: true,
            deprecated: false,
            unlisted: false,
            created: "2024-01-01",
            updated: "2024-01-03",
            definition: {
                type: "NUMBER",
                defaultValue: 10,
                constraints: {
                    min: 0,
                    max: 100,
                },
            },
            createdBy: {
                ref: { identifier: "user1" },
                login: "user1",
                firstName: "Jane",
                lastName: "Doe",
            },
            updatedBy: {
                ref: { identifier: "user2" },
                login: "user2",
                fullName: "John Smith",
            },
        };

        const catalogItem = convertParameterToCatalogItem(parameter);

        expect(catalogItem.type).toBe("parameter");
        expect(catalogItem.createdBy).toBe("Jane Doe");
        expect(catalogItem.updatedBy).toBe("John Smith");
        expect(catalogItem.isEditable).toBe(true);
        expect(catalogItem.definition).toEqual(parameter.definition);
    });
});

describe("convertComputedAttributeToCatalogItem", () => {
    const computedAttribute: IComputedAttributeMetadataObject = {
        id: "ca.id",
        uri: "/gdc/md/ca.id",
        ref: { identifier: "ca.id", type: "computedAttribute" },
        type: "computedAttribute",
        title: "Rep Performance",
        description: "Sales rep performance band",
        tags: ["sales"],
        production: true,
        deprecated: false,
        unlisted: false,
        expression: "SELECT 1",
        displayForms: [],
    };

    it("should carry over an undefined certification", () => {
        expect(convertComputedAttributeToCatalogItem(computedAttribute).certification).toBeUndefined();
    });

    it("should convert a certified computed attribute's certification metadata", () => {
        const catalogItem = convertComputedAttributeToCatalogItem({
            ...computedAttribute,
            certification: { status: "CERTIFIED", message: "Trusted attribute" },
        });

        expect(catalogItem.certification).toEqual(
            expect.objectContaining({ status: "CERTIFIED", message: "Trusted attribute" }),
        );
    });
});
