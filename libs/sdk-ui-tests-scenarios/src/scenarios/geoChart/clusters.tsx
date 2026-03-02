// (C) 2026 GoodData Corporation

import { ReferenceMd } from "@gooddata/reference-workspace";
import { GeoPushpinChart, type IGeoPushpinChartProps } from "@gooddata/sdk-ui-geo";

import { OfflineMapStyle } from "./_infra/offlineMapStyle.js";
import { scenariosFor } from "../../scenarioGroup.js";
import { ScenarioGroupNames } from "../charts/_infra/groupNames.js";

const geoVisualTestConfig = {
    screenshotSize: { width: 800, height: 800 },
    viewports: [{ label: "desktop", width: 1464, height: 768 }],
};

export const clusters = scenariosFor<IGeoPushpinChartProps>("GeoPushpinChart", GeoPushpinChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization, "clusters")
    .withDefaultBackendSettings({ enableNewGeoPushpin: true })
    .withVisualTestConfig(geoVisualTestConfig)
    .addScenario("clustered points", {
        latitude: ReferenceMd.City.Latitude,
        longitude: ReferenceMd.City.Longitude,
        config: {
            mapStyle: OfflineMapStyle,
            tooltipText: ReferenceMd.City.Name,
            points: {
                groupNearbyPoints: true,
            },
            viewport: {
                area: "world",
            },
        },
    })
    .addScenario("non-clustered points", {
        latitude: ReferenceMd.City.Latitude,
        longitude: ReferenceMd.City.Longitude,
        config: {
            mapStyle: OfflineMapStyle,
            tooltipText: ReferenceMd.City.Name,
            points: {
                groupNearbyPoints: false,
            },
            viewport: {
                area: "world",
            },
        },
    });
