// (C) 2026 GoodData Corporation

import { ReferenceMd } from "@gooddata/reference-workspace";
import {
    type IColorPalette,
    modifyAttribute,
    modifyMeasure,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";
import { HeaderPredicates } from "@gooddata/sdk-ui";
import {
    GeoAreaChart,
    GeoChart,
    GeoPushpinChart,
    type IGeoAreaChartProps,
    type IGeoChartProps,
    type IGeoPushpinChartProps,
    createAreaLayer,
    createPushpinLayer,
} from "@gooddata/sdk-ui-geo";

import { scenariosFor } from "../../scenarioGroup.js";
import { OfflineMapStyle } from "./_infra/offlineMapStyle.js";
import { ScenarioGroupNames } from "../charts/_infra/groupNames.js";

const GeoStateArea = modifyAttribute(ReferenceMd.State.Code, (m) => m.localId("geo.area"));
const Population = modifyMeasure(ReferenceMd.Population.Sum, (m) => m.alias("Population"));
const Revenue = modifyMeasure(ReferenceMd.Amount, (m) => m.alias("Revenue"));

const CoastRegions = ["West Coast", "East Coast"];
const westCoastPredicate = HeaderPredicates.attributeItemNameMatch("West Coast");
const eastCoastPredicate = HeaderPredicates.attributeItemNameMatch("East Coast");

const chartSegmentMapping = [
    { predicate: westCoastPredicate, color: { type: "rgb", value: { r: 0, g: 170, b: 95 } } as const },
    { predicate: eastCoastPredicate, color: { type: "rgb", value: { r: 235, g: 87, b: 87 } } as const },
];

const layerSegmentMapping = [
    { predicate: westCoastPredicate, color: { type: "rgb", value: { r: 20, g: 20, b: 20 } } as const },
    { predicate: eastCoastPredicate, color: { type: "rgb", value: { r: 255, g: 140, b: 0 } } as const },
];

const chartPalette: IColorPalette = [
    { guid: "chart-01", fill: { r: 17, g: 111, b: 224 } },
    { guid: "chart-02", fill: { r: 61, g: 184, b: 245 } },
    { guid: "chart-03", fill: { r: 252, g: 226, b: 5 } },
    { guid: "chart-04", fill: { r: 245, g: 135, b: 32 } },
    { guid: "chart-05", fill: { r: 213, g: 41, b: 65 } },
];

const layerPalette: IColorPalette = [
    { guid: "layer-01", fill: { r: 86, g: 48, b: 193 } },
    { guid: "layer-02", fill: { r: 120, g: 70, b: 230 } },
    { guid: "layer-03", fill: { r: 190, g: 93, b: 235 } },
    { guid: "layer-04", fill: { r: 255, g: 120, b: 170 } },
    { guid: "layer-05", fill: { r: 255, g: 73, b: 120 } },
];

const geoVisualTestConfig = {
    screenshotSize: { width: 800, height: 800 },
    viewports: [{ label: "desktop", width: 1464, height: 768 }],
};

const areaBorderConfig = {
    borderColor: "#000000",
    borderWidth: 2,
    fillOpacity: 0.9,
};

const areaSegmentLayerDef = {
    area: GeoStateArea,
    color: Revenue,
    segmentBy: ReferenceMd.Region.Default,
    tooltipText: ReferenceMd.State.Name,
    filters: [newPositiveAttributeFilter(ReferenceMd.Region.Default, CoastRegions)],
};

const areaGradientLayerDef = {
    area: GeoStateArea,
    color: Revenue,
    tooltipText: ReferenceMd.State.Name,
};

const pushpinSegmentLayerDef = {
    latitude: ReferenceMd.City.Latitude,
    longitude: ReferenceMd.City.Longitude,
    size: Population,
    segmentBy: ReferenceMd.Region.Default,
    tooltipText: ReferenceMd.City.Name,
    filters: [newPositiveAttributeFilter(ReferenceMd.Region.Default, CoastRegions)],
};

const pushpinGradientLayerDef = {
    latitude: ReferenceMd.City.Latitude,
    longitude: ReferenceMd.City.Longitude,
    color: Population,
    tooltipText: ReferenceMd.City.Name,
    filters: [newPositiveAttributeFilter(ReferenceMd.Region.Default, CoastRegions)],
};

export const pushpinColoring = scenariosFor<IGeoPushpinChartProps>("GeoPushpinChart", GeoPushpinChart)
    .withGroupNames(...ScenarioGroupNames.Coloring)
    .withDefaultBackendSettings({ enableNewGeoPushpin: true })
    .withVisualTestConfig(geoVisualTestConfig)
    .addScenario("pushpin chart-level custom segment mapping", {
        latitude: ReferenceMd.City.Latitude,
        longitude: ReferenceMd.City.Longitude,
        size: Population,
        segmentBy: ReferenceMd.Region.Default,
        filters: [newPositiveAttributeFilter(ReferenceMd.Region.Default, CoastRegions)],
        config: {
            mapStyle: OfflineMapStyle,
            viewport: { area: "continent_na" },
            tooltipText: ReferenceMd.City.Name,
            colorMapping: chartSegmentMapping,
        },
    })
    .addScenario("pushpin chart-level custom gradient palette", {
        latitude: ReferenceMd.City.Latitude,
        longitude: ReferenceMd.City.Longitude,
        color: Population,
        filters: [newPositiveAttributeFilter(ReferenceMd.Region.Default, CoastRegions)],
        config: {
            mapStyle: OfflineMapStyle,
            viewport: { area: "continent_na" },
            tooltipText: ReferenceMd.City.Name,
            colorPalette: chartPalette,
        },
    })
    .addScenario("pushpin size color gradient and segment", {
        latitude: ReferenceMd.City.Latitude,
        longitude: ReferenceMd.City.Longitude,
        size: Population,
        color: Revenue,
        segmentBy: ReferenceMd.Region.Default,
        filters: [newPositiveAttributeFilter(ReferenceMd.Region.Default, CoastRegions)],
        config: {
            mapStyle: OfflineMapStyle,
            viewport: { area: "continent_na" },
            tooltipText: ReferenceMd.City.Name,
            colorPalette: chartPalette,
            colorMapping: chartSegmentMapping,
        },
    });

export const areaColoring = scenariosFor<IGeoAreaChartProps>("GeoAreaChart", GeoAreaChart)
    .withGroupNames(...ScenarioGroupNames.Coloring)
    .withVisualTestConfig(geoVisualTestConfig)
    .addScenario("area chart-level custom segment mapping", {
        area: GeoStateArea,
        color: Revenue,
        segmentBy: ReferenceMd.Region.Default,
        filters: [newPositiveAttributeFilter(ReferenceMd.Region.Default, CoastRegions)],
        config: {
            mapStyle: OfflineMapStyle,
            viewport: { area: "continent_na" },
            colorMapping: chartSegmentMapping,
            areas: areaBorderConfig,
        },
    })
    .addScenario("area chart-level custom gradient palette", {
        area: GeoStateArea,
        color: Revenue,
        config: {
            mapStyle: OfflineMapStyle,
            viewport: { area: "continent_na" },
            colorPalette: chartPalette,
            areas: areaBorderConfig,
        },
    })
    .addScenario("area with color attribute categories", {
        area: GeoStateArea,
        color: ReferenceMd.Region.Default,
        filters: [newPositiveAttributeFilter(ReferenceMd.Region.Default, CoastRegions)],
        config: {
            mapStyle: OfflineMapStyle,
            viewport: { area: "continent_na" },
            colorMapping: chartSegmentMapping,
            areas: areaBorderConfig,
        },
    });

export const geoLayerColoringMatrix = scenariosFor<IGeoChartProps>("GeoChart", GeoChart)
    .withGroupNames(...ScenarioGroupNames.Coloring, "layer-config")
    .withVisualTestConfig(geoVisualTestConfig)
    .addScenario("area layer-level segment mapping overrides chart-level", {
        layers: [
            createAreaLayer(
                {
                    ...areaSegmentLayerDef,
                    config: { colorMapping: layerSegmentMapping },
                },
                "area-layer",
            ),
        ],
        config: {
            mapStyle: OfflineMapStyle,
            viewport: { area: "continent_na" },
            legend: { position: "right" },
            colorMapping: chartSegmentMapping,
            areas: areaBorderConfig,
        },
    })
    .addScenario("area layer-level gradient palette overrides chart-level", {
        layers: [
            createAreaLayer(
                {
                    ...areaGradientLayerDef,
                    config: { colorPalette: layerPalette },
                },
                "area-layer",
            ),
        ],
        config: {
            mapStyle: OfflineMapStyle,
            viewport: { area: "continent_na" },
            legend: { position: "right" },
            colorPalette: chartPalette,
            areas: areaBorderConfig,
        },
    })
    .addScenario("pushpin layer-level segment mapping overrides chart-level", {
        layers: [
            createPushpinLayer(
                {
                    ...pushpinSegmentLayerDef,
                    config: { colorMapping: layerSegmentMapping },
                },
                "pushpin-layer",
            ),
        ],
        config: {
            mapStyle: OfflineMapStyle,
            viewport: { area: "continent_na" },
            legend: { position: "right" },
            colorMapping: chartSegmentMapping,
        },
    })
    .addScenario("pushpin layer-level gradient palette overrides chart-level", {
        layers: [
            createPushpinLayer(
                {
                    ...pushpinGradientLayerDef,
                    config: { colorPalette: layerPalette },
                },
                "pushpin-layer",
            ),
        ],
        config: {
            mapStyle: OfflineMapStyle,
            viewport: { area: "continent_na" },
            legend: { position: "right" },
            colorPalette: chartPalette,
        },
    })
    .addScenario("multi-layer both inherit chart-level colors", {
        layers: [
            createAreaLayer(areaSegmentLayerDef, "area-layer"),
            createPushpinLayer(pushpinSegmentLayerDef, "pushpin-layer"),
        ],
        config: {
            mapStyle: OfflineMapStyle,
            viewport: { area: "continent_na" },
            legend: { position: "right" },
            colorPalette: chartPalette,
            colorMapping: chartSegmentMapping,
            areas: areaBorderConfig,
        },
    })
    .addScenario("multi-layer pushpin override only", {
        layers: [
            createAreaLayer(areaSegmentLayerDef, "area-layer"),
            createPushpinLayer(
                {
                    ...pushpinSegmentLayerDef,
                    config: { colorMapping: layerSegmentMapping },
                },
                "pushpin-layer",
            ),
        ],
        config: {
            mapStyle: OfflineMapStyle,
            viewport: { area: "continent_na" },
            legend: { position: "right" },
            colorMapping: chartSegmentMapping,
            areas: areaBorderConfig,
        },
    })
    .addScenario("multi-layer area override only", {
        layers: [
            createAreaLayer(
                {
                    ...areaSegmentLayerDef,
                    config: { colorMapping: layerSegmentMapping },
                },
                "area-layer",
            ),
            createPushpinLayer(pushpinSegmentLayerDef, "pushpin-layer"),
        ],
        config: {
            mapStyle: OfflineMapStyle,
            viewport: { area: "continent_na" },
            legend: { position: "right" },
            colorMapping: chartSegmentMapping,
            areas: areaBorderConfig,
        },
    })
    .addScenario("multi-layer both layer overrides with conflicting chart fallback", {
        layers: [
            createAreaLayer(
                {
                    ...areaSegmentLayerDef,
                    config: {
                        colorPalette: layerPalette,
                        colorMapping: layerSegmentMapping,
                    },
                },
                "area-layer",
            ),
            createPushpinLayer(
                {
                    ...pushpinSegmentLayerDef,
                    config: {
                        colorPalette: layerPalette,
                        colorMapping: layerSegmentMapping,
                    },
                },
                "pushpin-layer",
            ),
        ],
        config: {
            mapStyle: OfflineMapStyle,
            viewport: { area: "continent_na" },
            legend: { position: "right" },
            colorPalette: chartPalette,
            colorMapping: chartSegmentMapping,
            areas: areaBorderConfig,
        },
    });
