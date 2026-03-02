// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IAttributeDisplayFormMetadataObject,
    type IBucket,
    type ICatalogAttribute,
    type IInsight,
    type IInsightLayerDefinition,
    idRef,
    insightVisualizationType,
    newAttribute,
    newMeasure,
} from "@gooddata/sdk-model";
import { BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";

import { convertInsightToLayerTables, convertInsightToTableDefinition } from "./insightToTable.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createDisplayForm(
    id: string,
    attributeId: string,
    { isDefault, isPrimary }: { isDefault?: boolean; isPrimary?: boolean } = {},
): IAttributeDisplayFormMetadataObject {
    return {
        type: "displayForm",
        title: id,
        description: "",
        uri: `/${id}`,
        id,
        ref: idRef(id, "displayForm"),
        production: true,
        deprecated: false,
        unlisted: false,
        attribute: idRef(attributeId, "attribute"),
        ...(isDefault ? { isDefault: true } : {}),
        ...(isPrimary ? { isPrimary: true } : {}),
    };
}

function createCatalogAttribute(
    attributeId: string,
    displayForms: IAttributeDisplayFormMetadataObject[],
): ICatalogAttribute {
    return {
        type: "attribute",
        attribute: {
            type: "attribute",
            title: attributeId,
            description: "",
            uri: `/${attributeId}`,
            id: attributeId,
            ref: idRef(attributeId, "attribute"),
            production: true,
            deprecated: false,
            unlisted: false,
            displayForms,
        },
        defaultDisplayForm: displayForms[0],
        displayForms,
        geoPinDisplayForms: [],
        groups: [],
    };
}

function createInsight(
    visualizationUrl: string,
    buckets: IBucket[],
    layers?: IInsightLayerDefinition[],
): IInsight {
    return {
        insight: {
            title: "Test Insight",
            visualizationUrl,
            buckets,
            filters: [],
            sorts: [],
            properties: {},
            identifier: "test",
            uri: "/test",
            ref: idRef("test"),
            ...(layers ? { layers } : {}),
        },
    };
}

function createLayer(id: string, type: string, buckets: IBucket[], name?: string): IInsightLayerDefinition {
    return { id, type, buckets, ...(name ? { name } : {}) };
}

// ---------------------------------------------------------------------------
// Tests — convertInsightToLayerTables
// ---------------------------------------------------------------------------

describe("convertInsightToLayerTables", () => {
    const defaultLabel = createDisplayForm("label.default", "attr", { isDefault: true });
    const areaLabel = createDisplayForm("label.area", "attr");
    const locationLabel = createDisplayForm("label.location", "attr");
    const catalogAttributes = [createCatalogAttribute("attr", [defaultLabel, areaLabel, locationLabel])];

    it("returns undefined for non-geo insights", () => {
        const insight = createInsight("local:bar", [
            {
                localIdentifier: BucketNames.ATTRIBUTE,
                items: [newAttribute(idRef("label.area", "displayForm"))],
            },
        ]);
        const result = convertInsightToLayerTables(insight, {
            settings: { enableGeoArea: true, enableNewGeoPushpin: true },
            catalogAttributes,
        });
        expect(result).toBeUndefined();
    });

    it("returns undefined when geo flags are off (legacy)", () => {
        const insight = createInsight(`local:${VisualizationTypes.PUSHPIN}`, [
            {
                localIdentifier: BucketNames.LOCATION,
                items: [newAttribute(idRef("label.location", "displayForm"))],
            },
        ]);
        // No enableNewGeoPushpin flag
        const result = convertInsightToLayerTables(insight, {
            settings: {},
            catalogAttributes,
        });
        expect(result).toBeUndefined();
    });

    it("returns single-element array for single-layer new-geo pushpin", () => {
        const insight = createInsight(`local:${VisualizationTypes.PUSHPIN}`, [
            {
                localIdentifier: BucketNames.LOCATION,
                items: [newAttribute(idRef("label.location", "displayForm"))],
            },
            {
                localIdentifier: BucketNames.MEASURES,
                items: [newMeasure(idRef("measure1"))],
            },
        ]);
        const result = convertInsightToLayerTables(insight, {
            settings: { enableGeoChartA11yImprovements: true, enableNewGeoPushpin: true },
            catalogAttributes,
        });

        expect(result).toBeDefined();
        expect(result).toHaveLength(1);
        expect(result![0].layerId).toBe("root");
        expect(result![0].layerType).toBe("pushpin");
        expect(insightVisualizationType(result![0].tableInsight)).toBe("table");
    });

    it("returns single-element array for single-layer new-geo area", () => {
        const insight = createInsight(`local:${VisualizationTypes.CHOROPLETH}`, [
            {
                localIdentifier: BucketNames.AREA,
                items: [newAttribute(idRef("label.area", "displayForm"))],
            },
        ]);
        const result = convertInsightToLayerTables(insight, {
            settings: { enableGeoChartA11yImprovements: true, enableGeoArea: true },
            catalogAttributes,
        });

        expect(result).toBeDefined();
        expect(result).toHaveLength(1);
        expect(result![0].layerId).toBe("root");
        expect(result![0].layerType).toBe("area");
    });

    it("returns root + N elements for N additional layers", () => {
        const layer1 = createLayer(
            "layer-1",
            "pushpin",
            [
                {
                    localIdentifier: BucketNames.LOCATION,
                    items: [newAttribute(idRef("label.location", "displayForm"))],
                },
                {
                    localIdentifier: BucketNames.MEASURES,
                    items: [newMeasure(idRef("m1"))],
                },
            ],
            "Cities",
        );

        const layer2 = createLayer(
            "layer-2",
            "area",
            [
                {
                    localIdentifier: BucketNames.AREA,
                    items: [newAttribute(idRef("label.area", "displayForm"))],
                },
            ],
            "Regions",
        );

        const insight = createInsight(
            `local:${VisualizationTypes.PUSHPIN}`,
            [
                {
                    localIdentifier: BucketNames.LOCATION,
                    items: [newAttribute(idRef("label.location", "displayForm"))],
                },
            ],
            [layer1, layer2],
        );

        const result = convertInsightToLayerTables(insight, {
            settings: { enableGeoChartA11yImprovements: true, enableNewGeoPushpin: true },
            catalogAttributes,
        });

        expect(result).toHaveLength(3);

        // Root
        expect(result![0].layerId).toBe("root");
        expect(result![0].layerName).toBe("Test Insight");
        expect(result![0].layerType).toBe("pushpin");

        // Layer 1
        expect(result![1].layerId).toBe("layer-1");
        expect(result![1].layerName).toBe("Cities");
        expect(result![1].layerType).toBe("pushpin");

        // Layer 2
        expect(result![2].layerId).toBe("layer-2");
        expect(result![2].layerName).toBe("Regions");
        expect(result![2].layerType).toBe("area");
    });

    it("each tableInsight has visualizationUrl local:table", () => {
        const layer = createLayer("layer-1", "area", [
            {
                localIdentifier: BucketNames.AREA,
                items: [newAttribute(idRef("label.area", "displayForm"))],
            },
        ]);
        const insight = createInsight(
            `local:${VisualizationTypes.PUSHPIN}`,
            [
                {
                    localIdentifier: BucketNames.LOCATION,
                    items: [newAttribute(idRef("label.location", "displayForm"))],
                },
            ],
            [layer],
        );

        const result = convertInsightToLayerTables(insight, {
            settings: { enableGeoChartA11yImprovements: true, enableNewGeoPushpin: true },
            catalogAttributes,
        });

        result!.forEach((def) => {
            expect(def.tableInsight.insight.visualizationUrl).toBe("local:table");
        });
    });

    it("falls back to layer.id when layer has no name", () => {
        const layer = createLayer("unnamed-layer", "pushpin", [
            {
                localIdentifier: BucketNames.LOCATION,
                items: [newAttribute(idRef("label.location", "displayForm"))],
            },
        ]);
        const insight = createInsight(
            `local:${VisualizationTypes.PUSHPIN}`,
            [
                {
                    localIdentifier: BucketNames.LOCATION,
                    items: [newAttribute(idRef("label.location", "displayForm"))],
                },
            ],
            [layer],
        );

        const result = convertInsightToLayerTables(insight, {
            settings: { enableGeoChartA11yImprovements: true, enableNewGeoPushpin: true },
            catalogAttributes,
        });

        expect(result![1].layerName).toBe("unnamed-layer");
    });

    it("normalizes choropleth type to area", () => {
        const layer = createLayer(
            "layer-1",
            VisualizationTypes.CHOROPLETH,
            [
                {
                    localIdentifier: BucketNames.AREA,
                    items: [newAttribute(idRef("label.area", "displayForm"))],
                },
            ],
            "Choropleth Layer",
        );

        const insight = createInsight(
            `local:${VisualizationTypes.CHOROPLETH}`,
            [
                {
                    localIdentifier: BucketNames.AREA,
                    items: [newAttribute(idRef("label.area", "displayForm"))],
                },
            ],
            [layer],
        );

        const result = convertInsightToLayerTables(insight, {
            settings: { enableGeoChartA11yImprovements: true, enableGeoArea: true },
            catalogAttributes,
        });

        expect(result![0].layerType).toBe("area");
        expect(result![1].layerType).toBe("area");
    });

    it("attribute-only layers produce valid tables", () => {
        const insight = createInsight(`local:${VisualizationTypes.CHOROPLETH}`, [
            {
                localIdentifier: BucketNames.AREA,
                items: [newAttribute(idRef("label.area", "displayForm"))],
            },
        ]);

        const result = convertInsightToLayerTables(insight, {
            settings: { enableGeoChartA11yImprovements: true, enableGeoArea: true },
            catalogAttributes,
        });

        expect(result).toHaveLength(1);
        const tableInsight = result![0].tableInsight;
        expect(tableInsight.insight.visualizationUrl).toBe("local:table");
        // Should have attribute bucket with the area attribute
        const attrBucket = tableInsight.insight.buckets.find(
            (b) => b.localIdentifier === BucketNames.ATTRIBUTE,
        );
        expect(attrBucket).toBeDefined();
        expect(attrBucket!.items.length).toBeGreaterThan(0);
    });

    it("includes COLOR bucket measures in layered table output", () => {
        const insight = createInsight(`local:${VisualizationTypes.CHOROPLETH}`, [
            {
                localIdentifier: BucketNames.AREA,
                items: [newAttribute(idRef("label.area", "displayForm"))],
            },
            {
                localIdentifier: BucketNames.COLOR,
                items: [newMeasure(idRef("m-color"))],
            },
        ]);

        const result = convertInsightToLayerTables(insight, {
            settings: { enableGeoChartA11yImprovements: true, enableGeoArea: true },
            catalogAttributes,
        });

        const measuresBucket = result?.[0].tableInsight.insight.buckets.find(
            (bucket) => bucket.localIdentifier === BucketNames.MEASURES,
        );
        expect(measuresBucket).toBeDefined();
        expect(measuresBucket?.items).toHaveLength(1);
    });

    it("skips unsupported additional layer types", () => {
        const unsupportedLayer = createLayer("layer-unsupported", "heatmap", [
            {
                localIdentifier: BucketNames.MEASURES,
                items: [newMeasure(idRef("m-unsupported"))],
            },
        ]);

        const insight = createInsight(
            `local:${VisualizationTypes.PUSHPIN}`,
            [
                {
                    localIdentifier: BucketNames.LOCATION,
                    items: [newAttribute(idRef("label.location", "displayForm"))],
                },
            ],
            [unsupportedLayer],
        );

        const result = convertInsightToLayerTables(insight, {
            settings: { enableGeoChartA11yImprovements: true, enableNewGeoPushpin: true },
            catalogAttributes,
        });

        expect(result).toHaveLength(1);
        expect(result?.[0].layerId).toBe("root");
    });
});

// ---------------------------------------------------------------------------
// Regression — convertInsightToTableDefinition unchanged
// ---------------------------------------------------------------------------

describe("convertInsightToTableDefinition (regression)", () => {
    it("converts a bar chart to table", () => {
        const insight = createInsight("local:bar", [
            {
                localIdentifier: BucketNames.MEASURES,
                items: [newMeasure(idRef("m1"))],
            },
            {
                localIdentifier: BucketNames.VIEW,
                items: [newAttribute(idRef("a1", "displayForm"))],
            },
        ]);

        const result = convertInsightToTableDefinition(insight);
        expect(insightVisualizationType(result)).toBe("table");
    });

    it("returns original for table insight", () => {
        const insight = createInsight("local:table", [
            {
                localIdentifier: BucketNames.MEASURES,
                items: [newMeasure(idRef("m1"))],
            },
        ]);

        const result = convertInsightToTableDefinition(insight);
        expect(result).toBe(insight);
    });
});
