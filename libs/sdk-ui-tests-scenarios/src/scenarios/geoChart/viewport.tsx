// (C) 2026 GoodData Corporation

import { ReferenceMd } from "@gooddata/reference-workspace";
import { modifyAttribute, modifyMeasure } from "@gooddata/sdk-model";
import {
    GeoAreaChart,
    GeoPushpinChart,
    type IGeoAreaChartProps,
    type IGeoPushpinChartProps,
} from "@gooddata/sdk-ui-geo";

import { OfflineMapStyle } from "./_infra/offlineMapStyle.js";
import { scenariosFor } from "../../scenarioGroup.js";
import { ScenarioGroupNames } from "../charts/_infra/groupNames.js";

const GeoArea = modifyAttribute(ReferenceMd.Country.Code, (m) => m.localId("geo.area"));
const Population = modifyMeasure(ReferenceMd.Population.Sum, (m) => m.alias("Population"));
const geoVisualTestConfig = {
    screenshotSize: { width: 800, height: 800 },
    viewports: [{ label: "desktop", width: 1464, height: 768 }],
};

export const pushpinViewports = scenariosFor<IGeoPushpinChartProps>("GeoPushpinChart", GeoPushpinChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization, "viewport")
    .withDefaultBackendSettings({ enableNewGeoPushpin: true })
    .withVisualTestConfig(geoVisualTestConfig)
    .addScenario("viewport world", {
        latitude: ReferenceMd.City.Latitude,
        longitude: ReferenceMd.City.Longitude,
        size: Population,
        config: {
            mapStyle: OfflineMapStyle,
            tooltipText: ReferenceMd.City.Name,
            viewport: { area: "world" },
        },
    })
    .addScenario("viewport europe", {
        latitude: ReferenceMd.City.Latitude,
        longitude: ReferenceMd.City.Longitude,
        size: Population,
        config: {
            mapStyle: OfflineMapStyle,
            tooltipText: ReferenceMd.City.Name,
            viewport: { area: "continent_eu" },
        },
    })
    .addScenario("viewport north america with segment", {
        latitude: ReferenceMd.City.Latitude,
        longitude: ReferenceMd.City.Longitude,
        size: Population,
        segmentBy: ReferenceMd.Region.Default,
        config: {
            mapStyle: OfflineMapStyle,
            tooltipText: ReferenceMd.City.Name,
            viewport: { area: "continent_na" },
        },
    });

export const areaViewports = scenariosFor<IGeoAreaChartProps>("GeoAreaChart", GeoAreaChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization, "viewport")
    .withVisualTestConfig(geoVisualTestConfig)
    .addScenario("area viewport north america", {
        area: GeoArea,
        color: ReferenceMd.Amount,
        config: {
            mapStyle: OfflineMapStyle,
            viewport: { area: "continent_na" },
        },
    })
    .addScenario("area viewport world", {
        area: GeoArea,
        color: ReferenceMd.Amount,
        config: {
            mapStyle: OfflineMapStyle,
            viewport: { area: "world" },
            areas: {
                borderColor: "#000000",
                borderWidth: 2,
                fillOpacity: 0.9,
            },
        },
    });
