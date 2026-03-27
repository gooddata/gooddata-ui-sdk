// (C) 2023-2026 GoodData Corporation

import type { Visualisation } from "@gooddata/sdk-code-schemas/v1";

import { type ColorMapping } from "./types.js";
import {
    type ConfigDefaults,
    type VisualisationConfig,
    getValueOrDefault,
    loadConfig,
    saveConfigObject,
} from "./utils.js";
import { loadColorMapping, saveColorMapping } from "../utils/configUtils.js";

type DefaultProperties = {
    colorMapping: Array<ColorMapping>;
    legend: {
        enabled: boolean;
        position:
            | "top"
            | "bottom"
            | "left"
            | "right"
            | "auto"
            | "top-left"
            | "top-right"
            | "bottom-left"
            | "bottom-right";
    };
    longitude: string;
    latitude: string;
    tooltipText: string;
    basemap: string;
    colorScheme: string;
    viewport: {
        area:
            | "auto"
            | "continent_af"
            | "continent_as"
            | "continent_au"
            | "continent_eu"
            | "continent_na"
            | "continent_sa"
            | "world"
            | "custom";
        navigation: {
            pan: boolean;
            zoom: boolean;
        };
    };
    center: {
        lat: number;
        lng: number;
    };
    zoom: number;
    points: {
        groupNearbyPoints: boolean;
        maxSize: "0.5x" | "0.75x" | "normal" | "1.25x" | "1.5x" | "default";
        minSize: "0.5x" | "0.75x" | "normal" | "1.25x" | "1.5x" | "default";
    };
    disableAlerts: boolean;
    disableScheduledExports: boolean;
};

const DEFAULTS: ConfigDefaults<DefaultProperties> = {
    colorMapping: [],
    legend: {
        enabled: true,
        position: "auto",
    },
    longitude: "",
    latitude: "",
    tooltipText: "",
    basemap: "",
    colorScheme: "",
    viewport: {
        area: "auto",
        navigation: {
            pan: true,
            zoom: true,
        },
    },
    center: {
        lat: Number.NaN,
        lng: Number.NaN,
    },
    zoom: Number.NaN,
    points: {
        groupNearbyPoints: true,
        minSize: "default",
        maxSize: "default",
    },
    disableAlerts: false,
    disableScheduledExports: false,
};

function load(props: VisualisationConfig<DefaultProperties>) {
    return loadConfig(props, (key, value) => {
        switch (key) {
            case "colorMapping":
                return [["colors", loadColorMapping(value as (typeof DEFAULTS)["colorMapping"])]];
            case "legend": {
                const val = value as (typeof DEFAULTS)["legend"];
                return [
                    ["legend_enabled", getValueOrDefault(val.enabled, DEFAULTS.legend.enabled, "bool")],
                    ["legend_position", getValueOrDefault(val.position, DEFAULTS.legend.position)],
                ];
            }
            case "tooltipText": {
                return [["tooltip_text", getValueOrDefault(value as string, DEFAULTS.tooltipText)]];
            }
            case "basemap": {
                return [["basemap", getValueOrDefault(value as string, DEFAULTS.basemap)]];
            }
            case "colorScheme": {
                return [["color_scheme", getValueOrDefault(value as string, DEFAULTS.colorScheme)]];
            }
            case "viewport": {
                const val = value as (typeof DEFAULTS)["viewport"];
                return [
                    ["viewport", getValueOrDefault(val.area, DEFAULTS.viewport.area)],
                    [
                        "viewport_pan",
                        getValueOrDefault(val.navigation?.pan, DEFAULTS.viewport.navigation.pan, "bool"),
                    ],
                    [
                        "viewport_zoom",
                        getValueOrDefault(val.navigation?.zoom, DEFAULTS.viewport.navigation.zoom, "bool"),
                    ],
                ];
            }
            case "center": {
                const val = value as (typeof DEFAULTS)["center"];
                return [
                    ["center_lat", getValueOrDefault(val.lat, DEFAULTS.center.lat, "number")],
                    ["center_lng", getValueOrDefault(val.lng, DEFAULTS.center.lng, "number")],
                ];
            }
            case "zoom": {
                return [["zoom_level", getValueOrDefault(value as number, DEFAULTS.zoom, "number")]];
            }
            case "points": {
                const val = value as (typeof DEFAULTS)["points"];
                return [
                    [
                        "group_nearby_points",
                        getValueOrDefault(val.groupNearbyPoints, DEFAULTS.points.groupNearbyPoints, "bool"),
                    ],
                    ["min_size", getValueOrDefault(val.minSize, DEFAULTS.points.minSize)],
                    ["max_size", getValueOrDefault(val.maxSize, DEFAULTS.points.maxSize)],
                ];
            }
            case "disableAlerts":
                return [
                    ["disable_alerts", getValueOrDefault(value as boolean, DEFAULTS.disableAlerts, "bool")],
                ];
            case "disableScheduledExports":
                return [
                    [
                        "disable_scheduled_exports",
                        getValueOrDefault(value as boolean, DEFAULTS.disableScheduledExports, "bool"),
                    ],
                ];
            case "latitude":
            case "longitude":
            default:
                return [];
        }
    });
}

function save(
    _fields: Visualisation["query"]["fields"] | undefined,
    config: Visualisation["config"] | undefined,
    positions: Array<{ longitude: string; latitude: string }>,
) {
    if (!config) {
        const pos = positions[0];
        if (!pos) {
            return undefined;
        }

        return saveConfigObject({
            longitude: pos.longitude,
            latitude: pos.latitude,
        });
    }

    return saveConfigObject({
        colorMapping: saveConfigObject(saveColorMapping(config.colors ?? {})),
        legend: saveConfigObject({
            enabled: getValueOrDefault(config.legend_enabled, DEFAULTS.legend.enabled, "bool"),
            position: getValueOrDefault(config.legend_position, DEFAULTS.legend.position),
        }),
        tooltipText: getValueOrDefault(config.tooltip_text, DEFAULTS.tooltipText),
        basemap: getValueOrDefault(config.basemap, DEFAULTS.basemap),
        colorScheme: getValueOrDefault(config.color_scheme, DEFAULTS.colorScheme),
        viewport: saveConfigObject({
            area: getValueOrDefault(config.viewport, DEFAULTS.viewport.area),
            navigation: saveConfigObject({
                pan: getValueOrDefault(config.viewport_pan, DEFAULTS.viewport.navigation.pan, "bool"),
                zoom: getValueOrDefault(config.viewport_zoom, DEFAULTS.viewport.navigation.zoom, "bool"),
            }),
        }),
        center: saveConfigObject({
            lat: getValueOrDefault(config.center_lat, DEFAULTS.center.lat, "number"),
            lng: getValueOrDefault(config.center_lng, DEFAULTS.center.lng, "number"),
        }),
        zoom: getValueOrDefault(config.zoom_level, DEFAULTS.zoom, "number"),
        points: saveConfigObject({
            groupNearbyPoints: getValueOrDefault(
                config.group_nearby_points,
                DEFAULTS.points.groupNearbyPoints,
                "bool",
            ),
            minSize: getValueOrDefault(config.min_size, DEFAULTS.points.minSize),
            maxSize: getValueOrDefault(config.max_size, DEFAULTS.points.maxSize),
        }),
        disableAlerts: getValueOrDefault(config.disable_alerts, DEFAULTS.disableAlerts, "bool"),
        disableScheduledExports: getValueOrDefault(
            config.disable_scheduled_exports,
            DEFAULTS.disableScheduledExports,
            "bool",
        ),
        longitude: positions[0]?.longitude ?? "",
        latitude: positions[0]?.latitude ?? "",
    });
}

export const geoChart = {
    load,
    save,
    DEFAULTS,
};
