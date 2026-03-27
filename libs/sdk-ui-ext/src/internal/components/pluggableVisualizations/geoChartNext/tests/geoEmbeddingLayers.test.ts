// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef, newAttribute, newBucket, newInsightDefinition } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { buildGeoChartNextLayers } from "../geoEmbeddingLayers.js";

describe("buildGeoChartNextLayers", () => {
    it("preserves geoIcon for pushpin embedding", () => {
        const locationAttribute = newAttribute(idRef("label.location", "displayForm"), (attribute) =>
            attribute.localId("location_df"),
        );
        const insight = newInsightDefinition("local:geoPushpin", (builder) =>
            builder.buckets([newBucket(BucketNames.LOCATION, locationAttribute)]).properties({
                controls: {
                    latitude: "label.latitude",
                    longitude: "label.longitude",
                    geoIcon: "label.geoIcon",
                    points: {
                        shapeType: "iconByValue",
                    },
                },
            }),
        );

        const layers = buildGeoChartNextLayers(insight, "pushpin");

        expect(layers).toHaveLength(1);
        expect(layers[0]?.type).toBe("pushpin");

        if (layers[0]?.type !== "pushpin") {
            throw new Error("Expected pushpin layer");
        }

        expect(layers[0].geoIcon?.attribute.displayForm).toEqual(idRef("label.geoIcon", "displayForm"));
    });
});
