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

    it("normalizes legacy legend positions from insight properties", () => {
        const locationAttribute = newAttribute(idRef("nm_location", "displayForm"), (attribute) =>
            attribute.localId("location_id"),
        );
        const insight = newInsightDefinition("local:geoPushpin", (builder) =>
            builder.buckets([newBucket(BucketNames.LOCATION, locationAttribute)]).properties({
                controls: {
                    legend: {
                        position: "top",
                    },
                },
            }),
        );

        const config = geoConfigFromInsight(insight);

        expect(config.legend?.position).toBe("top-right");
    });

    it("maps legacy tileset visualization properties to basemap", () => {
        const locationAttribute = newAttribute(idRef("nm_location", "displayForm"), (attribute) =>
            attribute.localId("location_id"),
        );
        const insight = newInsightDefinition("local:geoPushpin", (builder) =>
            builder.buckets([newBucket(BucketNames.LOCATION, locationAttribute)]).properties({
                controls: {
                    tileset: "satellite",
                    viewport: {
                        area: "continent_na",
                    },
                },
            }),
        );

        const config = geoConfigFromInsight(insight);

        expect(config.basemap).toBe("satellite");
        expect(config.viewport?.area).toBe("continent_na");
    });

    it("prefers explicit basemap over legacy tileset visualization properties", () => {
        const locationAttribute = newAttribute(idRef("nm_location", "displayForm"), (attribute) =>
            attribute.localId("location_id"),
        );
        const insight = newInsightDefinition("local:geoPushpin", (builder) =>
            builder.buckets([newBucket(BucketNames.LOCATION, locationAttribute)]).properties({
                controls: {
                    basemap: "monochrome",
                    tileset: "satellite",
                },
            }),
        );

        const config = geoConfigFromInsight(insight);

        expect(config.basemap).toBe("monochrome");
    });

    it("keeps oneIcon points configuration", () => {
        const locationAttribute = newAttribute(idRef("nm_location", "displayForm"), (attribute) =>
            attribute.localId("location_id"),
        );
        const insight = newInsightDefinition("local:geoPushpin", (builder) =>
            builder.buckets([newBucket(BucketNames.LOCATION, locationAttribute)]).properties({
                controls: {
                    points: {
                        shapeType: "oneIcon",
                        icon: "airport",
                    },
                },
            }),
        );

        const config = geoConfigFromInsight(insight);

        expect(config.points).toEqual({
            shapeType: "oneIcon",
            icon: "airport",
        });
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

    it("normalizes legacy legend positions and keeps new corner values", () => {
        const config = buildGeoVisualizationConfig({
            options,
            supportedControls: {
                legend: {
                    position: "bottom",
                },
            },
            colorMapping: undefined,
            environment: "",
        });
        const configWithCorner = buildGeoVisualizationConfig({
            options,
            supportedControls: {
                legend: {
                    position: "bottom-left",
                },
            },
            colorMapping: undefined,
            environment: "",
        });

        expect(config.legend?.position).toBe("bottom-right");
        expect(configWithCorner.legend?.position).toBe("bottom-left");
    });

    it("drops colorScheme for basemaps that do not support it even when the broad basemap FF is disabled", () => {
        const supportedControls = {
            basemap: "none",
            colorScheme: "dark",
        };

        const disabledConfig = buildGeoVisualizationConfig({
            options,
            supportedControls,
            colorMapping: undefined,
            environment: ANALYTICAL_ENVIRONMENT,
        });
        const enabledConfig = buildGeoVisualizationConfig({
            options,
            supportedControls,
            colorMapping: undefined,
            environment: ANALYTICAL_ENVIRONMENT,
            featureFlags: { enableGeoBasemapConfig: true },
        });

        expect(disabledConfig.enableGeoBasemapConfig).toBe(false);
        expect(disabledConfig.basemap).toBe("none");
        expect(disabledConfig.colorScheme).toBeUndefined();
        expect(enabledConfig.enableGeoBasemapConfig).toBe(true);
        expect(enabledConfig.basemap).toBe("none");
        expect(enabledConfig.colorScheme).toBeUndefined();
    });

    it("does not let raw config or custom visualization config override sanitized supported controls", () => {
        const rawGeoStyleConfig = {
            basemap: "none",
            colorScheme: "dark",
        };
        const config = buildGeoVisualizationConfig({
            options: {
                ...options,
                config: {
                    isInEditMode: false,
                    ...rawGeoStyleConfig,
                },
                customVisualizationConfig: {
                    ...rawGeoStyleConfig,
                },
            },
            supportedControls: {
                basemap: "monochrome",
                colorScheme: "light",
            },
            colorMapping: undefined,
            environment: ANALYTICAL_ENVIRONMENT,
        });

        expect(config.basemap).toBe("monochrome");
        expect(config.colorScheme).toBe("light");
    });

    it("maps legacy tileset supported controls to basemap", () => {
        const config = buildGeoVisualizationConfig({
            options: {
                ...options,
                config: {
                    isInEditMode: false,
                },
            },
            supportedControls: {
                tileset: "satellite",
            },
            colorMapping: undefined,
            environment: ANALYTICAL_ENVIRONMENT,
        });

        expect(config.basemap).toBe("satellite");
    });

    it("does not forward bounds when viewport config is disabled", () => {
        const config = buildGeoVisualizationConfig({
            options,
            supportedControls: {
                center: { lat: 40, lng: -74 },
                zoom: 3,
                bounds: {
                    southWest: { lat: 35, lng: -80 },
                    northEast: { lat: 45, lng: -68 },
                },
                viewport: { area: "custom" },
            },
            colorMapping: undefined,
            environment: ANALYTICAL_ENVIRONMENT,
            featureFlags: {
                enableGeoChartsViewportConfig: false,
            },
        });

        expect(config.enableGeoChartsViewportConfig).toBe(false);
        expect(config.bounds).toBeUndefined();
        expect(config.center).toEqual({ lat: 40, lng: -74 });
        expect(config.zoom).toBe(3);
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

    it("normalizes legacy legend positions for geo area charts", () => {
        const config = buildAreaVisualizationConfig({
            options,
            supportedControls: {
                legend: {
                    position: "left",
                },
            },
            colorMapping: undefined,
            environment: "",
        });

        expect(config.legend?.position).toBe("top-left");
    });

    it("preserves sanitized basemap config even when the broad basemap FF is disabled", () => {
        const supportedControls = {
            basemap: "monochrome",
            colorScheme: "light",
        };

        const disabledConfig = buildAreaVisualizationConfig({
            options,
            supportedControls,
            colorMapping: undefined,
            environment: ANALYTICAL_ENVIRONMENT,
        });
        const enabledConfig = buildAreaVisualizationConfig({
            options,
            supportedControls,
            colorMapping: undefined,
            environment: ANALYTICAL_ENVIRONMENT,
            featureFlags: { enableGeoBasemapConfig: true },
        });

        expect(disabledConfig.enableGeoBasemapConfig).toBe(false);
        expect(disabledConfig.basemap).toBe("monochrome");
        expect(disabledConfig.colorScheme).toBe("light");
        expect(enabledConfig.enableGeoBasemapConfig).toBe(true);
        expect(enabledConfig.basemap).toBe("monochrome");
        expect(enabledConfig.colorScheme).toBe("light");
    });

    it("maps legacy tileset controls to basemap", () => {
        const config = buildAreaVisualizationConfig({
            options: {
                ...options,
                config: {
                    isInEditMode: false,
                },
            },
            supportedControls: {
                controls: {
                    tileset: "satellite",
                },
            },
            colorMapping: undefined,
            environment: ANALYTICAL_ENVIRONMENT,
        });

        expect(config.basemap).toBe("satellite");
    });
});
