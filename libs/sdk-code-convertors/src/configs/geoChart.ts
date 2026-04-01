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
    bounds: {
        northEast: { lat: number; lng: number };
        southWest: { lat: number; lng: number };
    };
    points: {
        groupNearbyPoints: boolean;
        maxSize: "0.5x" | "0.75x" | "normal" | "1.25x" | "1.5x" | "default";
        minSize: "0.5x" | "0.75x" | "normal" | "1.25x" | "1.5x" | "default";
        shapeType: "circle" | "iconByValue" | "oneIcon";
        icon: string;
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
    bounds: {
        northEast: { lat: Number.NaN, lng: Number.NaN },
        southWest: { lat: Number.NaN, lng: Number.NaN },
    },
    points: {
        groupNearbyPoints: true,
        minSize: "default",
        maxSize: "default",
        shapeType: "circle",
        icon: "",
    },
    disableAlerts: false,
    disableScheduledExports: false,
};

function sanitizeControls(controls: DefaultProperties): DefaultProperties {
    const sanitized = { ...controls };

    // Strip icon when shapeType is not "oneIcon"
    const shapeType = sanitized.points?.shapeType ?? "circle";
    if (shapeType !== "oneIcon" && sanitized.points?.icon) {
        sanitized.points = { ...sanitized.points, icon: "" };
    }

    // Strip center/zoom when bounds are present (bounds is canonical for custom viewport)
    const viewportArea = sanitized.viewport?.area ?? "auto";
    const isPresetViewport = viewportArea !== "auto" && viewportArea !== "custom";
    const hasBounds =
        sanitized.bounds?.northEast?.lat !== undefined &&
        !isNaN(sanitized.bounds?.northEast?.lat) &&
        sanitized.bounds?.southWest?.lat !== undefined &&
        !isNaN(sanitized.bounds?.southWest?.lat);

    if (isPresetViewport) {
        sanitized.center = { lat: Number.NaN, lng: Number.NaN };
        sanitized.zoom = Number.NaN;
        sanitized.bounds = {
            northEast: { lat: Number.NaN, lng: Number.NaN },
            southWest: { lat: Number.NaN, lng: Number.NaN },
        };
    } else if (hasBounds) {
        sanitized.center = { lat: Number.NaN, lng: Number.NaN };
        sanitized.zoom = Number.NaN;
    }

    return sanitized;
}

function load(props: VisualisationConfig<DefaultProperties>) {
    const sanitizedProps = props.controls ? { controls: sanitizeControls(props.controls) } : props;
    return loadConfig(sanitizedProps, (key, value) => {
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
            case "bounds": {
                const val = value as (typeof DEFAULTS)["bounds"];
                return [
                    [
                        "viewport_bounds_ne_lat",
                        getValueOrDefault(val.northEast?.lat, DEFAULTS.bounds.northEast.lat, "number"),
                    ],
                    [
                        "viewport_bounds_ne_lng",
                        getValueOrDefault(val.northEast?.lng, DEFAULTS.bounds.northEast.lng, "number"),
                    ],
                    [
                        "viewport_bounds_sw_lat",
                        getValueOrDefault(val.southWest?.lat, DEFAULTS.bounds.southWest.lat, "number"),
                    ],
                    [
                        "viewport_bounds_sw_lng",
                        getValueOrDefault(val.southWest?.lng, DEFAULTS.bounds.southWest.lng, "number"),
                    ],
                ];
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
                    ["shape_type", getValueOrDefault(val.shapeType, DEFAULTS.points.shapeType)],
                    ["icon", getValueOrDefault(val.icon, DEFAULTS.points.icon)],
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

    // Sanitize shapeType/icon: icon is only valid for "oneIcon"
    const shapeType = getValueOrDefault(config["shape_type"], DEFAULTS.points.shapeType);
    const icon =
        shapeType === "oneIcon" ? getValueOrDefault(config["icon"], DEFAULTS.points.icon) : undefined;

    // Sanitize viewport-related properties:
    // - Preset viewports (continent_*, world) are self-contained — strip bounds, center, zoom
    // - Custom viewport with bounds — strip center/zoom (bounds is canonical)
    // - Custom viewport without bounds — keep center/zoom as fallback
    const viewportArea = getValueOrDefault(config.viewport, DEFAULTS.viewport.area);
    const isPresetViewport =
        viewportArea !== undefined && viewportArea !== "auto" && viewportArea !== "custom";
    const hasBounds =
        !isPresetViewport &&
        config["viewport_bounds_ne_lat"] !== undefined &&
        config["viewport_bounds_sw_lat"] !== undefined;
    const stripPositionalProps = isPresetViewport || hasBounds;
    const centerLat = stripPositionalProps
        ? undefined
        : getValueOrDefault(config.center_lat, DEFAULTS.center.lat, "number");
    const centerLng = stripPositionalProps
        ? undefined
        : getValueOrDefault(config.center_lng, DEFAULTS.center.lng, "number");
    const zoomVal = stripPositionalProps
        ? undefined
        : getValueOrDefault(config.zoom_level, DEFAULTS.zoom, "number");
    const bounds = isPresetViewport
        ? undefined
        : saveConfigObject({
              northEast: saveConfigObject({
                  lat: getValueOrDefault(
                      config["viewport_bounds_ne_lat"],
                      DEFAULTS.bounds.northEast.lat,
                      "number",
                  ),
                  lng: getValueOrDefault(
                      config["viewport_bounds_ne_lng"],
                      DEFAULTS.bounds.northEast.lng,
                      "number",
                  ),
              }),
              southWest: saveConfigObject({
                  lat: getValueOrDefault(
                      config["viewport_bounds_sw_lat"],
                      DEFAULTS.bounds.southWest.lat,
                      "number",
                  ),
                  lng: getValueOrDefault(
                      config["viewport_bounds_sw_lng"],
                      DEFAULTS.bounds.southWest.lng,
                      "number",
                  ),
              }),
          });

    return saveConfigObject({
        colorMapping: saveConfigObject(saveColorMapping(config.colors ?? {})),
        legend: saveConfigObject({
            enabled: getValueOrDefault(config.legend_enabled, DEFAULTS.legend.enabled, "bool"),
            position: getValueOrDefault(config.legend_position, DEFAULTS.legend.position),
        }),
        tooltipText: getValueOrDefault(config.tooltip_text, DEFAULTS.tooltipText),
        basemap: getValueOrDefault(config.basemap, DEFAULTS.basemap),
        viewport: saveConfigObject({
            area: viewportArea,
            navigation: saveConfigObject({
                pan: getValueOrDefault(config.viewport_pan, DEFAULTS.viewport.navigation.pan, "bool"),
                zoom: getValueOrDefault(config.viewport_zoom, DEFAULTS.viewport.navigation.zoom, "bool"),
            }),
        }),
        center: saveConfigObject({
            lat: centerLat,
            lng: centerLng,
        }),
        zoom: zoomVal,
        bounds,
        points: saveConfigObject({
            groupNearbyPoints: getValueOrDefault(
                config.group_nearby_points,
                DEFAULTS.points.groupNearbyPoints,
                "bool",
            ),
            minSize: getValueOrDefault(config.min_size, DEFAULTS.points.minSize),
            maxSize: getValueOrDefault(config.max_size, DEFAULTS.points.maxSize),
            shapeType,
            icon,
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
