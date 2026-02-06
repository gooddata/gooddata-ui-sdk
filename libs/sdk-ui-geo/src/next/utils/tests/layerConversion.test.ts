// (C) 2025-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IInsightLayerDefinition,
    type IRgbColor,
    attributeDisplayFormRef,
    attributeLocalId,
    idRef,
    newAttribute,
    newBucket,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { insightLayerToGeoLayer, insightLayersToGeoLayers } from "../layerConversion.js";

function createAttribute(localId: string) {
    return newAttribute(idRef(localId), (attribute) => attribute.localId(localId));
}

function createLocationAttribute(displayFormId: string, localId: string) {
    return newAttribute(idRef(displayFormId, "displayForm"), (attribute) => attribute.localId(localId));
}

function createPushpinLayer(
    buckets: ReturnType<typeof newBucket>[],
    properties?: Record<string, unknown>,
): IInsightLayerDefinition {
    return {
        id: "pushpin-layer",
        type: "pushpin",
        buckets,
        properties,
    };
}

describe("layerConversion", () => {
    it("should convert pushpin layer with explicit latitude/longitude buckets", () => {
        const latitudeAttr = createAttribute("latitude_attr");
        const longitudeAttr = createAttribute("longitude_attr");
        const layerDef = createPushpinLayer([
            newBucket(BucketNames.LATITUDE, latitudeAttr),
            newBucket(BucketNames.LONGITUDE, longitudeAttr),
        ]);

        const result = insightLayerToGeoLayer(layerDef);

        if (result?.type !== "pushpin") {
            throw new Error("Expected pushpin layer");
        }

        expect(result.latitude).toEqual(latitudeAttr);
        expect(result.longitude).toEqual(longitudeAttr);
    });

    it("should derive latitude/longitude attributes from layer controls", () => {
        const locationAttr = createLocationAttribute("customer_city.city_latitude", "loc");
        const layerDef = createPushpinLayer([newBucket(BucketNames.LOCATION, locationAttr)], {
            controls: {
                latitude: "customer_city.city_latitude",
                longitude: "customer_city.city_longitude",
            },
        });

        const result = insightLayerToGeoLayer(layerDef);

        if (result?.type !== "pushpin") {
            throw new Error("Expected pushpin layer");
        }

        expect(attributeDisplayFormRef(result.latitude)).toEqual(
            idRef("customer_city.city_latitude", "displayForm"),
        );
        expect(attributeLocalId(result.latitude)).toBe("loc");
        expect(attributeDisplayFormRef(result.longitude)).toEqual(
            idRef("customer_city.city_longitude", "displayForm"),
        );
    });

    it("should convert colorMapping items from layer controls", () => {
        const latitudeAttr = createAttribute("latitude_attr");
        const longitudeAttr = createAttribute("longitude_attr");
        const mappedColor: IRgbColor = { type: "rgb", value: { r: 175, g: 13, b: 242 } };
        const layerDef = createPushpinLayer(
            [newBucket(BucketNames.LATITUDE, latitudeAttr), newBucket(BucketNames.LONGITUDE, longitudeAttr)],
            {
                controls: {
                    colorMapping: [{ id: "Canada", color: mappedColor }],
                },
            },
        );

        const result = insightLayerToGeoLayer(layerDef);

        if (result?.type !== "pushpin") {
            throw new Error("Expected pushpin layer");
        }

        expect(result.config?.colorMapping).toHaveLength(1);
        expect(result.config?.colorMapping?.[0]?.color).toEqual(mappedColor);
        expect(result.config?.colorMapping?.[0]?.predicate).toEqual(expect.any(Function));
    });

    it("should keep LOCATION localId for latitude even if LATITUDE bucket exists", () => {
        const locationAttr = createLocationAttribute("customer_city.city_latitude", "loc");
        const latitudeAttr = createLocationAttribute("customer_city.city_latitude", "latitude_df");
        const longitudeAttr = createLocationAttribute("customer_city.city_longitude", "longitude_df");

        const layerDef = createPushpinLayer([
            newBucket(BucketNames.LOCATION, locationAttr),
            newBucket(BucketNames.LATITUDE, latitudeAttr),
            newBucket(BucketNames.LONGITUDE, longitudeAttr),
        ]);

        const result = insightLayerToGeoLayer(layerDef);

        if (result?.type !== "pushpin") {
            throw new Error("Expected pushpin layer");
        }

        expect(attributeLocalId(result.latitude)).toBe("loc");
    });

    it("should skip pushpin layers without latitude/longitude", () => {
        const invalidLayer = createPushpinLayer([]);
        const locationOnlyLayer = createPushpinLayer([
            newBucket(BucketNames.LOCATION, createAttribute("loc")),
        ]);
        const validLayer = createPushpinLayer([newBucket(BucketNames.LOCATION, createAttribute("loc"))], {
            controls: {
                latitude: "lat_df",
                longitude: "lng_df",
            },
        });

        // Layer without any buckets should be null
        expect(insightLayerToGeoLayer(invalidLayer)).toBeNull();

        // Layer with only location bucket (no controls) should be null
        expect(insightLayerToGeoLayer(locationOnlyLayer)).toBeNull();

        const layers = insightLayersToGeoLayers([invalidLayer, locationOnlyLayer, validLayer]);
        expect(layers).toHaveLength(1);
        const firstLayer = layers[0];
        if (firstLayer?.type !== "pushpin") {
            throw new Error("Expected pushpin layer");
        }
        expect(firstLayer.id).toBe(validLayer.id);
        expect(firstLayer.latitude).toBeDefined();
        expect(firstLayer.longitude).toBeDefined();
    });
});
