// (C) 2023-2026 GoodData Corporation

import type { Visualisation } from "@gooddata/sdk-code-schemas/v1";

import {
    DEFAULT_CUSTOM_TOOLTIP,
    loadColorMapping,
    loadCustomTooltip,
    loadDisableKda,
    saveColorMapping,
    saveCustomTooltip,
} from "../utils/configUtils.js";

import { type ColorMapping, type ICustomTooltip } from "./types.js";
import {
    type ConfigDefaults,
    type VisualisationConfig,
    getValueOrDefault,
    loadConfig,
    saveConfigObject,
} from "./utils.js";

/** @internal */
export type GeoAreaChartConfigProperties = {
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
    disableKeyDriveAnalysisOn: Record<string, boolean>;
    customTooltip: ICustomTooltip;
};

/** @internal */
const DEFAULTS: ConfigDefaults<GeoAreaChartConfigProperties> = {
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
    disableKeyDriveAnalysisOn: {},
    customTooltip: DEFAULT_CUSTOM_TOOLTIP,
};

function sanitizeControls(controls: GeoAreaChartConfigProperties): GeoAreaChartConfigProperties {
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

/** @internal */
export const GEO_AREA_CHART_DEFAULTS = DEFAULTS;

/** @internal */
export function geoAreaChartLoad(props: VisualisationConfig<GeoAreaChartConfigProperties>) {
    const sanitizedProps = props.controls ? { controls: sanitizeControls(props.controls) } : props;
    return loadConfig(sanitizedProps, (key, value) => {
        switch (key) {
            case "colorMapping":
                return [["colors", loadColorMapping(value)]];
            case "legend": {
                return [
                    ["legend_enabled", getValueOrDefault(value.enabled, DEFAULTS.legend.enabled, "bool")],
                    ["legend_position", getValueOrDefault(value.position, DEFAULTS.legend.position)],
                ];
            }
            case "tooltipText": {
                return [["tooltip_text", getValueOrDefault(value, DEFAULTS.tooltipText)]];
            }
            case "basemap": {
                return [["basemap", getValueOrDefault(value, DEFAULTS.basemap)]];
            }
            case "viewport": {
                return [
                    ["viewport", getValueOrDefault(value.area, DEFAULTS.viewport.area)],
                    [
                        "viewport_pan",
                        getValueOrDefault(value.navigation?.pan, DEFAULTS.viewport.navigation.pan, "bool"),
                    ],
                    [
                        "viewport_zoom",
                        getValueOrDefault(value.navigation?.zoom, DEFAULTS.viewport.navigation.zoom, "bool"),
                    ],
                ];
            }
            case "center": {
                return [
                    ["center_lat", getValueOrDefault(value.lat, DEFAULTS.center.lat, "number")],
                    ["center_lng", getValueOrDefault(value.lng, DEFAULTS.center.lng, "number")],
                ];
            }
            case "zoom": {
                return [["zoom_level", getValueOrDefault(value, DEFAULTS.zoom, "number")]];
            }
            case "bounds": {
                return [
                    [
                        "viewport_bounds_ne_lat",
                        getValueOrDefault(value.northEast?.lat, DEFAULTS.bounds.northEast.lat, "number"),
                    ],
                    [
                        "viewport_bounds_ne_lng",
                        getValueOrDefault(value.northEast?.lng, DEFAULTS.bounds.northEast.lng, "number"),
                    ],
                    [
                        "viewport_bounds_sw_lat",
                        getValueOrDefault(value.southWest?.lat, DEFAULTS.bounds.southWest.lat, "number"),
                    ],
                    [
                        "viewport_bounds_sw_lng",
                        getValueOrDefault(value.southWest?.lng, DEFAULTS.bounds.southWest.lng, "number"),
                    ],
                ];
            }
            case "disableAlerts":
                return [["disable_alerts", getValueOrDefault(value, DEFAULTS.disableAlerts, "bool")]];
            case "disableScheduledExports":
                return [
                    [
                        "disable_scheduled_exports",
                        getValueOrDefault(value, DEFAULTS.disableScheduledExports, "bool"),
                    ],
                ];
            case "disableKeyDriveAnalysisOn":
                return [["disable_key_drive_analysis", loadDisableKda(value)]];
            case "customTooltip":
                return [["custom_tooltip", loadCustomTooltip(value)]];
            default:
                key satisfies never; // Check that no key is forgotten in the cases above
                return [];
        }
    });
}

/** @internal */
export function geoAreaChartSave(
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
        disableKeyDriveAnalysisOn: saveConfigObject(config.disable_key_drive_analysis),
        customTooltip: saveConfigObject(saveCustomTooltip(config.custom_tooltip)),
    });
}

/**
 * @internal
 * @deprecated Use geoAreaChartLoad and geoAreaChartSave instead.
 */
export interface IGeoAreaChartConfig {
    load: typeof geoAreaChartLoad;
    save: typeof geoAreaChartSave;
    DEFAULTS: ConfigDefaults<GeoAreaChartConfigProperties>;
}

/**
 * @internal
 * @deprecated Use geoAreaChartLoad and geoAreaChartSave instead.
 */
export const geoAreaChart: IGeoAreaChartConfig = {
    load: geoAreaChartLoad,
    save: geoAreaChartSave,
    DEFAULTS,
};
