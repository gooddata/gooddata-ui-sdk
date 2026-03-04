// (C) 2025-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef, newAttribute, newBucket, newInsightDefinition } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { geoConfigFromInsight, geoInsightConversion } from "./geoConfigBuilder.js";
import { type IEmbeddingCodeContext } from "../../../interfaces/VisualizationDescriptor.js";

describe("geoConfigFromInsight", () => {
    it("keeps mapStyle configuration", () => {
        const areaAttribute = newAttribute(idRef("label.area", "displayForm"), (attribute) =>
            attribute.localId("area_df"),
        );
        const insight = newInsightDefinition("local:geoArea", (builder) =>
            builder.buckets([newBucket(BucketNames.AREA, areaAttribute)]).properties({
                controls: {
                    mapStyle: "gd://custom-style",
                },
            }),
        );

        const config = geoConfigFromInsight(insight);

        expect(config.mapStyle).toBe("gd://custom-style");
    });

    it("keeps zoom configuration", () => {
        const areaAttribute = newAttribute(idRef("label.area", "displayForm"), (attribute) =>
            attribute.localId("area_df"),
        );
        const insight = newInsightDefinition("local:geoArea", (builder) =>
            builder.buckets([newBucket(BucketNames.AREA, areaAttribute)]).properties({
                controls: {
                    zoom: 4,
                },
            }),
        );

        const config = geoConfigFromInsight(insight);

        expect(config.zoom).toBe(4);
    });
});

describe("geoInsightConversion", () => {
    it("returns area bucket attribute when converting AREA bucket", () => {
        const areaAttribute = newAttribute(idRef("label.area", "displayForm"), (attribute) =>
            attribute.localId("area_df"),
        );
        const insight = newInsightDefinition("local:geoArea", (builder) =>
            builder.buckets([newBucket(BucketNames.AREA, areaAttribute)]),
        );

        const conversion = geoInsightConversion<{ area: unknown }, "area">("area", BucketNames.AREA);
        const ctx = {} as IEmbeddingCodeContext;
        const attribute = conversion.itemAccessor(insight, ctx);

        expect(attribute?.attribute?.localIdentifier).toBe("area_df");
    });

    it("uses clean localId for latitude without a_ prefix", () => {
        const locationAttribute = newAttribute(idRef("nm_location", "displayForm"), (attribute) =>
            attribute.localId("location_id"),
        );
        const insight = newInsightDefinition("local:geoPushpin", (builder) =>
            builder.buckets([newBucket(BucketNames.LOCATION, locationAttribute)]).properties({
                controls: {
                    latitude: "nm_latitude",
                    longitude: "nm_longitude",
                },
            }),
        );

        const conversion = geoInsightConversion<{ latitude: unknown }, "latitude">(
            "latitude",
            BucketNames.LATITUDE,
        );
        const ctx = {
            backend: { capabilities: { supportsSeparateLatitudeLongitudeLabels: true } },
        } as unknown as IEmbeddingCodeContext;
        const attribute = conversion.itemAccessor(insight, ctx);

        expect(attribute?.attribute?.localIdentifier).toBe("latitude_df");
        expect(attribute?.attribute?.displayForm).toEqual(idRef("nm_latitude", "displayForm"));
    });

    it("uses clean localId for longitude without a_ prefix", () => {
        const locationAttribute = newAttribute(idRef("nm_location", "displayForm"), (attribute) =>
            attribute.localId("location_id"),
        );
        const insight = newInsightDefinition("local:geoPushpin", (builder) =>
            builder.buckets([newBucket(BucketNames.LOCATION, locationAttribute)]).properties({
                controls: {
                    latitude: "nm_latitude",
                    longitude: "nm_longitude",
                },
            }),
        );

        const conversion = geoInsightConversion<{ longitude: unknown }, "longitude">(
            "longitude",
            BucketNames.LONGITUDE,
        );
        const ctx = {
            backend: { capabilities: { supportsSeparateLatitudeLongitudeLabels: true } },
        } as unknown as IEmbeddingCodeContext;
        const attribute = conversion.itemAccessor(insight, ctx);

        expect(attribute?.attribute?.localIdentifier).toBe("longitude_df");
        expect(attribute?.attribute?.displayForm).toEqual(idRef("nm_longitude", "displayForm"));
    });
});
