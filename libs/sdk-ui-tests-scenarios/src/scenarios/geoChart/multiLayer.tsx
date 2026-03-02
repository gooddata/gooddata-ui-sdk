// (C) 2026 GoodData Corporation

import { ReferenceMd } from "@gooddata/reference-workspace";
import { modifyAttribute, modifyMeasure, newPositiveAttributeFilter } from "@gooddata/sdk-model";
import { HeaderPredicates } from "@gooddata/sdk-ui";
import { GeoChart, type IGeoChartProps, createAreaLayer, createPushpinLayer } from "@gooddata/sdk-ui-geo";

import { OfflineMapStyle } from "./_infra/offlineMapStyle.js";
import { scenariosFor } from "../../scenarioGroup.js";
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

const geoVisualTestConfig = {
    screenshotSize: { width: 800, height: 800 },
    viewports: [{ label: "desktop", width: 1464, height: 768 }],
};

const areaLayer = createAreaLayer(
    {
        area: GeoStateArea,
        color: Revenue,
        segmentBy: ReferenceMd.Region.Default,
        tooltipText: ReferenceMd.State.Name,
        filters: [newPositiveAttributeFilter(ReferenceMd.Region.Default, CoastRegions)],
    },
    "area-layer",
);

const pushpinLayer = createPushpinLayer(
    {
        latitude: ReferenceMd.City.Latitude,
        longitude: ReferenceMd.City.Longitude,
        size: Population,
        tooltipText: ReferenceMd.City.Name,
        filters: [newPositiveAttributeFilter(ReferenceMd.Region.Default, CoastRegions)],
    },
    "pushpin-layer",
);

const pushpinSegmentLayer = createPushpinLayer(
    {
        latitude: ReferenceMd.City.Latitude,
        longitude: ReferenceMd.City.Longitude,
        size: Population,
        segmentBy: ReferenceMd.Region.Default,
        tooltipText: ReferenceMd.City.Name,
        filters: [newPositiveAttributeFilter(ReferenceMd.Region.Default, CoastRegions)],
    },
    "pushpin-layer-2",
);

const pushpinClusterLayer = createPushpinLayer(
    {
        latitude: ReferenceMd.City.Latitude,
        longitude: ReferenceMd.City.Longitude,
        tooltipText: ReferenceMd.City.Name,
    },
    "pushpin-layer-cluster",
);

export const multiLayer = scenariosFor<IGeoChartProps>("GeoChart", GeoChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization, "multi-layer")
    .withVisualTestConfig(geoVisualTestConfig)
    .addScenario("area primary with pushpin overlay", {
        layers: [areaLayer, pushpinLayer],
        config: {
            mapStyle: OfflineMapStyle,
            viewport: { area: "continent_na" },
            legend: { position: "right" },
            areas: {
                borderColor: "#000000",
                borderWidth: 2,
                fillOpacity: 0.9,
            },
        },
    })
    .addScenario("area primary with two pushpin overlays", {
        layers: [areaLayer, pushpinLayer, pushpinSegmentLayer],
        config: {
            mapStyle: OfflineMapStyle,
            viewport: { area: "continent_na" },
            legend: { position: "right" },
            areas: {
                borderColor: "#000000",
                borderWidth: 2,
                fillOpacity: 0.9,
            },
        },
    })
    .addScenario("multi-layer chart-level segment mapping", {
        layers: [areaLayer, pushpinSegmentLayer],
        config: {
            mapStyle: OfflineMapStyle,
            viewport: { area: "continent_na" },
            legend: { position: "right" },
            colorMapping: chartSegmentMapping,
            areas: {
                borderColor: "#000000",
                borderWidth: 2,
                fillOpacity: 0.9,
            },
        },
    })
    .addScenario("multi-layer per-layer segment mapping override", {
        layers: [
            areaLayer,
            createPushpinLayer(
                {
                    latitude: ReferenceMd.City.Latitude,
                    longitude: ReferenceMd.City.Longitude,
                    size: Population,
                    segmentBy: ReferenceMd.Region.Default,
                    tooltipText: ReferenceMd.City.Name,
                    filters: [newPositiveAttributeFilter(ReferenceMd.Region.Default, CoastRegions)],
                    config: { colorMapping: layerSegmentMapping },
                },
                "pushpin-layer-override",
            ),
        ],
        config: {
            mapStyle: OfflineMapStyle,
            viewport: { area: "continent_na" },
            legend: { position: "right" },
            colorMapping: chartSegmentMapping,
            areas: {
                borderColor: "#000000",
                borderWidth: 2,
                fillOpacity: 0.9,
            },
        },
    });

export const multiLayerClusters = scenariosFor<IGeoChartProps>("GeoChart", GeoChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization, "multi-layer", "clusters")
    .withVisualTestConfig(geoVisualTestConfig)
    .addScenario("area with clustered pushpin overlay", {
        layers: [areaLayer, pushpinClusterLayer],
        config: {
            mapStyle: OfflineMapStyle,
            viewport: { area: "world" },
            legend: { position: "right" },
            points: {
                groupNearbyPoints: true,
            },
            areas: {
                borderColor: "#000000",
                borderWidth: 2,
                fillOpacity: 0.9,
            },
        },
    })
    .addScenario("area with non-clustered pushpin overlay", {
        layers: [areaLayer, pushpinClusterLayer],
        config: {
            mapStyle: OfflineMapStyle,
            viewport: { area: "world" },
            legend: { position: "right" },
            points: {
                groupNearbyPoints: false,
            },
            areas: {
                borderColor: "#000000",
                borderWidth: 2,
                fillOpacity: 0.9,
            },
        },
    });
