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

import {
    geoLayerToInsightLayer,
    insightLayerToGeoLayer,
    insightLayersToGeoLayers,
} from "../layerConversion.js";

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

    it("should resolve latitude display form from LOCATION when controls use LOCATION localId", () => {
        const locationAttr = createLocationAttribute("nm_latitude", "a_nm_latitude");
        const layerDef = createPushpinLayer([newBucket(BucketNames.LOCATION, locationAttr)], {
            controls: {
                latitude: "a_nm_latitude",
                longitude: "nm_longitude",
            },
        });

        const result = insightLayerToGeoLayer(layerDef);

        if (result?.type !== "pushpin") {
            throw new Error("Expected pushpin layer");
        }

        expect(attributeDisplayFormRef(result.latitude)).toEqual(idRef("nm_latitude", "displayForm"));
        expect(attributeLocalId(result.latitude)).toBe("a_nm_latitude");
        expect(attributeDisplayFormRef(result.longitude)).toEqual(idRef("nm_longitude", "displayForm"));
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

    it("should extract per-layer customTooltip from layer controls (F1-2543)", () => {
        const layerDef = createPushpinLayer(
            [
                newBucket(BucketNames.LATITUDE, createAttribute("latitude_attr")),
                newBucket(BucketNames.LONGITUDE, createAttribute("longitude_attr")),
            ],
            {
                controls: {
                    customTooltip: {
                        content: "short name in France: {label/nm_city_name_fr}",
                        enabled: true,
                    },
                },
            },
        );

        const result = insightLayerToGeoLayer(layerDef);

        if (result?.type !== "pushpin") {
            throw new Error("Expected pushpin layer");
        }

        expect(result.config?.customTooltip).toEqual({
            content: "short name in France: {label/nm_city_name_fr}",
            enabled: true,
        });
    });

    it("should extract per-layer customTooltip on area layers", () => {
        const areaLayerDef: IInsightLayerDefinition = {
            id: "area-layer",
            type: "area",
            buckets: [newBucket(BucketNames.AREA, createAttribute("state"))],
            properties: {
                controls: { customTooltip: { content: "state: {label/state}", enabled: true } },
            },
        };

        const result = insightLayerToGeoLayer(areaLayerDef);

        if (result?.type !== "area") {
            throw new Error("Expected area layer");
        }

        expect(result.config?.customTooltip).toEqual({ content: "state: {label/state}", enabled: true });
    });

    it("should roundtrip per-layer customTooltip back into layer controls", () => {
        const layerDef = createPushpinLayer(
            [
                newBucket(BucketNames.LATITUDE, createAttribute("latitude_attr")),
                newBucket(BucketNames.LONGITUDE, createAttribute("longitude_attr")),
            ],
            {
                controls: {
                    customTooltip: { content: "city: {label/city}", enabled: true, placement: "below" },
                },
            },
        );

        const geoLayer = insightLayerToGeoLayer(layerDef);
        if (!geoLayer) {
            throw new Error("Expected geo layer");
        }

        const serialized = geoLayerToInsightLayer(geoLayer);

        expect(serialized.properties?.["controls"]).toMatchObject({
            customTooltip: { content: "city: {label/city}", enabled: true, placement: "below" },
        });
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
