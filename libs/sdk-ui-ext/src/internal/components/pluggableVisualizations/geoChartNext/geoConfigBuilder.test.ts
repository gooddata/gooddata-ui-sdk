// (C) 2025-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef, newAttribute, newBucket, newInsightDefinition } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import {
    buildGeoVisualizationConfig,
    geoConfigFromInsight,
    geoInsightConversion,
} from "./geoConfigBuilder.js";
import { ANALYTICAL_ENVIRONMENT, DASHBOARDS_ENVIRONMENT } from "../../../constants/properties.js";
import { type IEmbeddingCodeContext } from "../../../interfaces/VisualizationDescriptor.js";
import { buildAreaVisualizationConfig } from "../geoAreaChart/geoAreaConfigBuilder.js";

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

describe("buildGeoVisualizationConfig", () => {
    const options = {
        messages: {},
    };

    it("applies viewport navigation in dashboards, leaves embedded unset, and disables in AD", () => {
        const dashboardWidgetConfig = buildGeoVisualizationConfig({
            options: {
                ...options,
                config: {
                    isInEditMode: false,
                },
            },
            supportedControls: {},
            colorMapping: undefined,
            environment: DASHBOARDS_ENVIRONMENT,
        });
        const embeddedConfig = buildGeoVisualizationConfig({
            options: {
                ...options,
                config: {},
            },
            supportedControls: {},
            colorMapping: undefined,
            environment: "",
        });
        const adConfig = buildGeoVisualizationConfig({
            options: {
                ...options,
                config: {
                    isInEditMode: true,
                },
            },
            supportedControls: {},
            colorMapping: undefined,
            environment: ANALYTICAL_ENVIRONMENT,
        });

        expect(dashboardWidgetConfig.applyViewportNavigation).toBe(true);
        expect(embeddedConfig.applyViewportNavigation).toBeUndefined();
        expect(adConfig.applyViewportNavigation).toBe(false);
    });
});

describe("buildAreaVisualizationConfig", () => {
    const options = {
        messages: {},
    };

    it("applies viewport navigation in dashboards, leaves embedded unset, and disables in AD", () => {
        const dashboardWidgetConfig = buildAreaVisualizationConfig({
            options: {
                ...options,
                config: {
                    isInEditMode: false,
                },
            },
            supportedControls: {},
            colorMapping: undefined,
            environment: DASHBOARDS_ENVIRONMENT,
        });
        const embeddedConfig = buildAreaVisualizationConfig({
            options: {
                ...options,
                config: {},
            },
            supportedControls: {},
            colorMapping: undefined,
            environment: "",
        });
        const adConfig = buildAreaVisualizationConfig({
            options: {
                ...options,
                config: {
                    isInEditMode: true,
                },
            },
            supportedControls: {},
            colorMapping: undefined,
            environment: ANALYTICAL_ENVIRONMENT,
        });

        expect(dashboardWidgetConfig.applyViewportNavigation).toBe(true);
        expect(embeddedConfig.applyViewportNavigation).toBeUndefined();
        expect(adConfig.applyViewportNavigation).toBe(false);
    });
});
