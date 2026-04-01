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
    disableAlerts: boolean;
    disableScheduledExports: boolean;
};

const DEFAULTS: ConfigDefaults<DefaultProperties> = {
    colorMapping: [],
    legend: {
        enabled: true,
        position: "auto",
    },
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
    disableAlerts: false,
    disableScheduledExports: false,
};

function sanitizeControls(controls: DefaultProperties): DefaultProperties {
    const sanitized = { ...controls };

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
            default:
                return [];
        }
    });
}

function save(
    _fields: Visualisation["query"]["fields"] | undefined,
    config: Visualisation["config"] | undefined,
    _positions: Array<{ longitude: string; latitude: string }>,
) {
    if (!config) {
        return undefined;
    }

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
        disableAlerts: getValueOrDefault(config.disable_alerts, DEFAULTS.disableAlerts, "bool"),
        disableScheduledExports: getValueOrDefault(
            config.disable_scheduled_exports,
            DEFAULTS.disableScheduledExports,
            "bool",
        ),
    });
}

export const geoAreaChart = {
    load,
    save,
    DEFAULTS,
};
