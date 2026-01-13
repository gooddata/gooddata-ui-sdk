// (C) 2025-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef, newAttribute, newBucket, newInsightDefinition } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { geoConfigFromInsight, geoInsightConversion } from "./geoConfigBuilder.js";
import { type IEmbeddingCodeContext } from "../../../interfaces/VisualizationDescriptor.js";

describe("geoConfigFromInsight", () => {
    it("converts tooltip text identifiers to attributes and keeps mapStyle", () => {
        const areaAttribute = newAttribute(idRef("label.area", "displayForm"), (attribute) =>
            attribute.localId("area_df"),
        );
        const insight = newInsightDefinition("local:geoArea", (builder) =>
            builder.buckets([newBucket(BucketNames.AREA, areaAttribute)]).properties({
                controls: {
                    tooltipText: "label.area.tooltip",
                    mapStyle: "gd://custom-style",
                },
            }),
        );

        const config = geoConfigFromInsight(insight);

        expect(config.mapStyle).toBe("gd://custom-style");
        expect(config.tooltipText?.attribute?.localIdentifier).toBe("tooltipText_df");
    });

    it("falls back to location attribute when area bucket is missing", () => {
        const locationAttribute = newAttribute(idRef("label.location", "displayForm"), (attribute) =>
            attribute.localId("location_df"),
        );
        const insight = newInsightDefinition("local:geoPushpin", (builder) =>
            builder.buckets([newBucket(BucketNames.LOCATION, locationAttribute)]).properties({
                controls: {
                    tooltipText: "label.location.tooltip",
                },
            }),
        );

        const config = geoConfigFromInsight(insight);

        expect(config.tooltipText?.attribute?.localIdentifier).toBe("tooltipText_df");
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
});
