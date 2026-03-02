// (C) 2026 GoodData Corporation

import { ReferenceMd } from "@gooddata/reference-workspace";
import {
    modifyAttribute,
    modifyMeasure,
    newMeasureSort,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";
import {
    GeoAreaChart,
    GeoPushpinChart,
    type IGeoAreaChartProps,
    type IGeoPushpinChartProps,
} from "@gooddata/sdk-ui-geo";

import { OfflineMapStyle } from "./_infra/offlineMapStyle.js";
import { scenariosFor } from "../../scenarioGroup.js";
import { ScenarioGroupNames } from "../charts/_infra/groupNames.js";

const GeoCountryArea = modifyAttribute(ReferenceMd.Country.Code, (m) => m.localId("geo.area"));
const GeoStateArea = modifyAttribute(ReferenceMd.State.Code, (m) => m.localId("geo.area"));
const Population = modifyMeasure(ReferenceMd.Population.Sum, (m) => m.alias("Population"));
const Revenue = modifyMeasure(ReferenceMd.Amount, (m) => m.alias("Revenue"));
const CoastRegions = ["West Coast", "East Coast"];
const geoVisualTestConfig = {
    screenshotSize: { width: 800, height: 800 },
    viewports: [{ label: "desktop", width: 1464, height: 768 }],
};

export const pushpinBase = scenariosFor<IGeoPushpinChartProps>("GeoPushpinChart", GeoPushpinChart)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .withDefaultBackendSettings({ enableNewGeoPushpin: true })
    .withVisualTestConfig(geoVisualTestConfig)
    .addScenario("latitude/longitude with size and color", {
        latitude: ReferenceMd.City.Latitude,
        longitude: ReferenceMd.City.Longitude,
        size: Population,
        color: Revenue,
        config: {
            mapStyle: OfflineMapStyle,
            tooltipText: ReferenceMd.City.Name,
            viewport: { area: "world" },
        },
    })
    .addScenario("latitude/longitude with color and segment", {
        latitude: ReferenceMd.City.Latitude,
        longitude: ReferenceMd.City.Longitude,
        color: Population,
        segmentBy: ReferenceMd.Region.Default,
        filters: [newPositiveAttributeFilter(ReferenceMd.Region.Default, CoastRegions)],
        sortBy: [newMeasureSort(Population, "desc")],
        config: {
            mapStyle: OfflineMapStyle,
            tooltipText: ReferenceMd.City.Name,
            viewport: { area: "world" },
        },
    })
    .addScenario("latitude/longitude with color attribute", {
        latitude: ReferenceMd.City.Latitude,
        longitude: ReferenceMd.City.Longitude,
        color: ReferenceMd.Region.Default,
        filters: [newPositiveAttributeFilter(ReferenceMd.Region.Default, CoastRegions)],
        config: {
            mapStyle: OfflineMapStyle,
            tooltipText: ReferenceMd.City.Name,
            viewport: { area: "continent_na" },
        },
    });

export const areaBase = scenariosFor<IGeoAreaChartProps>("GeoAreaChart", GeoAreaChart)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .withVisualTestConfig(geoVisualTestConfig)
    .addScenario("area with color gradient", {
        area: GeoStateArea,
        color: Revenue,
        sortBy: [newMeasureSort(Revenue, "desc")],
        config: {
            mapStyle: OfflineMapStyle,
            viewport: { area: "continent_na" },
            areas: {
                borderColor: "#000000",
                borderWidth: 2,
                fillOpacity: 0.9,
            },
        },
    })
    .addScenario("area with color and segment", {
        area: GeoStateArea,
        color: Revenue,
        segmentBy: ReferenceMd.Region.Default,
        filters: [newPositiveAttributeFilter(ReferenceMd.Region.Default, CoastRegions)],
        sortBy: [newMeasureSort(Revenue, "desc")],
        config: {
            mapStyle: OfflineMapStyle,
            viewport: { area: "continent_na" },
            areas: {
                borderColor: "#000000",
                borderWidth: 2,
                fillOpacity: 0.9,
            },
        },
    })
    .addScenario("area with color attribute", {
        area: GeoCountryArea,
        color: ReferenceMd.Region.Default,
        filters: [newPositiveAttributeFilter(ReferenceMd.Region.Default, CoastRegions)],
        config: {
            mapStyle: OfflineMapStyle,
            viewport: { area: "continent_na" },
            areas: {
                borderColor: "#000000",
                borderWidth: 2,
                fillOpacity: 0.9,
            },
        },
    });
