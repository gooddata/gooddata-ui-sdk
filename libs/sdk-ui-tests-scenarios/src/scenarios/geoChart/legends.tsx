// (C) 2026 GoodData Corporation

import { ReferenceMd } from "@gooddata/reference-workspace";
import { modifyAttribute, modifyMeasure, newPositiveAttributeFilter } from "@gooddata/sdk-model";
import {
    GeoAreaChart,
    GeoPushpinChart,
    type IGeoAreaChartProps,
    type IGeoChartLegendConfig,
    type IGeoPushpinChartProps,
} from "@gooddata/sdk-ui-geo";

import { OfflineMapStyle } from "./_infra/offlineMapStyle.js";
import { scenariosFor } from "../../scenarioGroup.js";
import { ScenarioGroupNames } from "../charts/_infra/groupNames.js";

const legendPositions: Array<IGeoChartLegendConfig["position"]> = [
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
];
const selectedRegionSegments = ["West Coast", "East Coast"];
const GeoStateArea = modifyAttribute(ReferenceMd.State.Code, (m) => m.localId("geo.area"));
const Population = modifyMeasure(ReferenceMd.Population.Sum, (m) => m.alias("Population"));
const Revenue = modifyMeasure(ReferenceMd.Amount, (m) => m.alias("Revenue"));
const geoVisualTestConfig = {
    screenshotSize: { width: 800, height: 800 },
    viewports: [{ label: "desktop", width: 1464, height: 768 }],
};

const areaBorderConfig = {
    borderColor: "#000000",
    borderWidth: 2,
    fillOpacity: 0.9,
};

export const legends = scenariosFor<IGeoPushpinChartProps>("GeoPushpinChart", GeoPushpinChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization, "legend")
    .withDefaultBackendSettings({ enableNewGeoPushpin: true })
    .withVisualTestConfig(geoVisualTestConfig)
    .addScenarios(
        "legend position",
        {
            latitude: ReferenceMd.City.Latitude,
            longitude: ReferenceMd.City.Longitude,
            size: Population,
            segmentBy: ReferenceMd.Region.Default,
            filters: [newPositiveAttributeFilter(ReferenceMd.Region.Default, selectedRegionSegments)],
            config: {
                mapStyle: OfflineMapStyle,
                tooltipText: ReferenceMd.City.Name,
            },
        },
        (baseName, baseProps) => {
            const baseConfig = baseProps.config ?? {
                mapStyle: OfflineMapStyle,
            };

            return legendPositions.map((position) => {
                return [
                    `${baseName} ${position}`,
                    {
                        ...baseProps,
                        config: {
                            ...baseConfig,
                            legend: { position },
                        },
                    },
                ];
            });
        },
    )
    .addScenario("legend with selection", {
        latitude: ReferenceMd.City.Latitude,
        longitude: ReferenceMd.City.Longitude,
        size: Population,
        segmentBy: ReferenceMd.Region.Default,
        filters: [newPositiveAttributeFilter(ReferenceMd.Region.Default, selectedRegionSegments)],
        config: {
            mapStyle: OfflineMapStyle,
            tooltipText: ReferenceMd.City.Name,
            legend: { position: "top-right" },
            selectedSegmentItems: selectedRegionSegments,
        },
    })
    .addScenario("legend size color-scale and category", {
        latitude: ReferenceMd.City.Latitude,
        longitude: ReferenceMd.City.Longitude,
        size: Population,
        color: Revenue,
        segmentBy: ReferenceMd.Region.Default,
        filters: [newPositiveAttributeFilter(ReferenceMd.Region.Default, selectedRegionSegments)],
        config: {
            mapStyle: OfflineMapStyle,
            tooltipText: ReferenceMd.City.Name,
            viewport: { area: "continent_na" },
            legend: { position: "top-right" },
        },
    })
    .addScenario("legend category edge case with empty regions", {
        latitude: ReferenceMd.City.Latitude,
        longitude: ReferenceMd.City.Longitude,
        size: Population,
        segmentBy: ReferenceMd.Region.Default,
        config: {
            mapStyle: OfflineMapStyle,
            tooltipText: ReferenceMd.City.Name,
            viewport: { area: "continent_na" },
            legend: { position: "top-right" },
        },
    });

export const areaLegends = scenariosFor<IGeoAreaChartProps>("GeoAreaChart", GeoAreaChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization, "legend")
    .withVisualTestConfig(geoVisualTestConfig)
    .addScenarios(
        "area legend position",
        {
            area: GeoStateArea,
            color: Revenue,
            segmentBy: ReferenceMd.Region.Default,
            filters: [newPositiveAttributeFilter(ReferenceMd.Region.Default, selectedRegionSegments)],
            config: {
                mapStyle: OfflineMapStyle,
                viewport: { area: "continent_na" },
                areas: areaBorderConfig,
            },
        },
        (baseName, baseProps) => {
            const baseConfig = baseProps.config ?? {
                mapStyle: OfflineMapStyle,
            };

            return legendPositions.map((position) => {
                return [
                    `${baseName} ${position}`,
                    {
                        ...baseProps,
                        config: {
                            ...baseConfig,
                            legend: { position },
                        },
                    },
                ];
            });
        },
    )
    .addScenario("area legend with selection", {
        area: GeoStateArea,
        color: Revenue,
        segmentBy: ReferenceMd.Region.Default,
        filters: [newPositiveAttributeFilter(ReferenceMd.Region.Default, selectedRegionSegments)],
        config: {
            mapStyle: OfflineMapStyle,
            viewport: { area: "continent_na" },
            legend: { position: "top-right" },
            selectedSegmentItems: selectedRegionSegments,
            areas: areaBorderConfig,
        },
    })
    .addScenario("area legend with color-scale only", {
        area: GeoStateArea,
        color: Revenue,
        config: {
            mapStyle: OfflineMapStyle,
            viewport: { area: "continent_na" },
            legend: { position: "bottom-right" },
            areas: areaBorderConfig,
        },
    })
    .addScenario("area legend with category and color-scale", {
        area: GeoStateArea,
        color: Revenue,
        segmentBy: ReferenceMd.Region.Default,
        filters: [newPositiveAttributeFilter(ReferenceMd.Region.Default, selectedRegionSegments)],
        config: {
            mapStyle: OfflineMapStyle,
            viewport: { area: "continent_na" },
            legend: { position: "top-right" },
            areas: areaBorderConfig,
        },
    });
