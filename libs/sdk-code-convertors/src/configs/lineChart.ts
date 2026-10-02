// (C) 2023-2026 GoodData Corporation

import type { Visualisation } from "@gooddata/sdk-code-schemas/v1";

import {
    DEFAULT_CUSTOM_TOOLTIP,
    loadColorMapping,
    loadCustomTooltip,
    loadDisableKda,
    loadLineStyleMapping,
    saveColorMapping,
    saveCustomTooltip,
    saveLineStyleMapping,
} from "../utils/configUtils.js";

import {
    type ColorMapping,
    type ICustomTooltip,
    type LineStyleMapping,
    type PointShapeSymbol,
} from "./types.js";
import {
    type ConfigDefaults,
    type VisualisationConfig,
    getValueOrDefault,
    loadConfig,
    saveConfigObject,
} from "./utils.js";

/** @internal */
export type LineChartConfigProperties = {
    colorMapping: Array<ColorMapping>;
    continuousLine: {
        enabled: boolean;
    };
    distinctPointShapes: {
        enabled: boolean;
        pointShapeMapping?: Record<string, PointShapeSymbol>;
    };
    dataLabels: {
        visible: boolean | "auto";
        style: "auto" | "backplate";
    };
    dataPoints: {
        visible: boolean | "auto";
    };
    legend: {
        enabled: boolean;
        position: "top" | "bottom" | "left" | "right" | "auto";
    };
    xaxis: {
        name: {
            visible: boolean;
            position: "center" | "left" | "right" | "auto";
        };
        labelsEnabled: boolean;
        rotation: "0" | "30" | "60" | "90" | "auto";
        visible: boolean;
    };
    yaxis: {
        format: "inherit" | "auto";
        max: number | string;
        min: number | string;
        name: {
            visible: boolean;
            position: "center" | "left" | "right" | "auto";
        };
        labelsEnabled: boolean;
        rotation: "0" | "30" | "60" | "90" | "auto";
        visible: boolean;
    };
    grid: {
        enabled: boolean;
    };
    forecast: {
        enabled: boolean;
        confidence: number;
        period: number;
        seasonal: boolean;
    };
    anomalies: {
        enabled: boolean;
        sensitivity: "low" | "medium" | "high";
        size: "small" | "medium" | "big";
        color: string | number;
    };
    disableDrillDown: boolean;
    disableDrillIntoURL: boolean;
    disableAlerts: boolean;
    disableScheduledExports: boolean;
    disableKeyDriveAnalysisOn: Record<string, boolean>;
    customTooltip: ICustomTooltip;
    thresholdMeasures: string[];
    thresholdExcludedMeasures: string[];
    lineStyleMapping: Array<LineStyleMapping>;
};

/** @internal */
const DEFAULTS: ConfigDefaults<LineChartConfigProperties> = {
    colorMapping: [],
    continuousLine: {
        enabled: false,
    },
    distinctPointShapes: {
        enabled: false,
    },
    dataLabels: {
        visible: false,
        style: "auto",
    },
    dataPoints: {
        visible: "auto",
    },
    legend: {
        enabled: true,
        position: "auto",
    },
    xaxis: {
        name: {
            visible: true,
            position: "auto",
        },
        labelsEnabled: true,
        rotation: "auto",
        visible: true,
    },
    yaxis: {
        format: "auto",
        max: "",
        min: "",
        name: {
            visible: true,
            position: "auto",
        },
        labelsEnabled: true,
        rotation: "auto",
        visible: true,
    },
    grid: {
        enabled: true,
    },
    forecast: {
        enabled: false,
        confidence: 0.95,
        period: 3,
        seasonal: false,
    },
    anomalies: {
        enabled: false,
        sensitivity: "medium",
        size: "medium",
        color: "rgb(255, 0, 0)",
    },
    disableDrillDown: false,
    disableDrillIntoURL: false,
    disableAlerts: false,
    disableScheduledExports: false,
    disableKeyDriveAnalysisOn: {},
    customTooltip: DEFAULT_CUSTOM_TOOLTIP,
    thresholdMeasures: [],
    thresholdExcludedMeasures: [],
    lineStyleMapping: [],
};

/** @internal */
export const LINE_CHART_DEFAULTS = DEFAULTS;

/** @internal */
export function lineChartLoad(props: VisualisationConfig<LineChartConfigProperties>) {
    return loadConfig(props, (key, value) => {
        switch (key) {
            case "colorMapping":
                return [["colors", loadColorMapping(value)]];
            case "continuousLine": {
                return [
                    [
                        "continuous_line",
                        getValueOrDefault(value.enabled, DEFAULTS.continuousLine.enabled, "bool"),
                    ],
                ];
            }
            case "distinctPointShapes": {
                const distinctPointShapes = {
                    enabled: getValueOrDefault(value.enabled, DEFAULTS.distinctPointShapes.enabled, "bool"),
                    point_shape_mapping:
                        value.pointShapeMapping ?? DEFAULTS.distinctPointShapes.pointShapeMapping,
                };
                return [["distinct_point_shapes", distinctPointShapes]];
            }
            case "dataLabels": {
                return [
                    [
                        "data_labels",
                        getValueOrDefault(value.visible, DEFAULTS.dataLabels.visible, "bool_auto"),
                    ],
                    ["data_labels_style", getValueOrDefault(value.style, DEFAULTS.dataLabels.style)],
                ];
            }
            case "dataPoints": {
                return [
                    [
                        "data_points",
                        getValueOrDefault(value.visible, DEFAULTS.dataPoints.visible, "bool_auto"),
                    ],
                ];
            }
            case "legend": {
                return [
                    ["legend_enabled", getValueOrDefault(value.enabled, DEFAULTS.legend.enabled, "bool")],
                    ["legend_position", getValueOrDefault(value.position, DEFAULTS.legend.position)],
                ];
            }
            case "xaxis": {
                return [
                    [
                        "xaxis_name_position",
                        getValueOrDefault(value.name?.position, DEFAULTS.xaxis.name.position),
                    ],
                    [
                        "xaxis_name_visible",
                        getValueOrDefault(value.name?.visible, DEFAULTS.xaxis.name.visible, "bool"),
                    ],
                    ["xaxis_rotation", getValueOrDefault(value.rotation, DEFAULTS.xaxis.rotation)],
                    ["xaxis_visible", getValueOrDefault(value.visible, DEFAULTS.xaxis.visible, "bool")],
                    [
                        "xaxis_labels",
                        getValueOrDefault(value.labelsEnabled, DEFAULTS.xaxis.labelsEnabled, "bool"),
                    ],
                ];
            }
            case "yaxis": {
                return [
                    ["yaxis_format", getValueOrDefault(value.format, DEFAULTS.yaxis.format)],
                    ["yaxis_max", getValueOrDefault(value.max, DEFAULTS.yaxis.max, "number")],
                    ["yaxis_min", getValueOrDefault(value.min, DEFAULTS.yaxis.min, "number")],
                    [
                        "yaxis_name_position",
                        getValueOrDefault(value.name?.position, DEFAULTS.yaxis.name.position),
                    ],
                    [
                        "yaxis_name_visible",
                        getValueOrDefault(value.name?.visible, DEFAULTS.yaxis.name.visible, "bool"),
                    ],
                    ["yaxis_rotation", getValueOrDefault(value.rotation, DEFAULTS.yaxis.rotation)],
                    ["yaxis_visible", getValueOrDefault(value.visible, DEFAULTS.yaxis.visible, "bool")],
                    [
                        "yaxis_labels",
                        getValueOrDefault(value.labelsEnabled, DEFAULTS.yaxis.labelsEnabled, "bool"),
                    ],
                ];
            }
            case "grid": {
                return [["grid_enabled", getValueOrDefault(value.enabled, DEFAULTS.grid.enabled, "bool")]];
            }
            case "forecast": {
                return [
                    ["forecast_enabled", getValueOrDefault(value.enabled, DEFAULTS.forecast.enabled, "bool")],
                    [
                        "forecast_confidence",
                        getValueOrDefault(value.confidence, DEFAULTS.forecast.confidence, "number"),
                    ],
                    ["forecast_period", getValueOrDefault(value.period, DEFAULTS.forecast.period, "number")],
                    [
                        "forecast_seasonal",
                        getValueOrDefault(value.seasonal, DEFAULTS.forecast.seasonal, "bool"),
                    ],
                ];
            }
            case "anomalies": {
                return [
                    [
                        "anomaly_detection_enabled",
                        getValueOrDefault(value.enabled, DEFAULTS.anomalies.enabled, "bool"),
                    ],
                    [
                        "anomaly_detection_sensitivity",
                        getValueOrDefault(value.sensitivity, DEFAULTS.anomalies.sensitivity),
                    ],
                    ["anomaly_detection_size", getValueOrDefault(value.size, DEFAULTS.anomalies.size)],
                    ["anomaly_detection_color", getValueOrDefault(value.color, DEFAULTS.anomalies.color)],
                ];
            }
            case "disableDrillDown":
                return [["disable_drill_down", getValueOrDefault(value, DEFAULTS.disableDrillDown, "bool")]];
            case "disableDrillIntoURL":
                // Org-specific default (enableDrillToUrlByDefault); always serialise when set so it round-trips.
                return [["disable_drill_into_url", Boolean(value)]];
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
            case "thresholdMeasures": {
                return [
                    [
                        "line_style_control_metrics",
                        getValueOrDefault(value, DEFAULTS.thresholdMeasures, "array"),
                    ],
                ];
            }
            case "thresholdExcludedMeasures": {
                return [
                    [
                        "line_style_excluded_metrics",
                        getValueOrDefault(value, DEFAULTS.thresholdExcludedMeasures, "array"),
                    ],
                ];
            }
            case "lineStyleMapping":
                return [["line_style_mapping", loadLineStyleMapping(value)]];
            default:
                key satisfies never; // Check that no key is forgotten in the cases above
                return [];
        }
    });
}

/** @internal */
export function lineChartSave(
    _fields: Visualisation["query"]["fields"] | undefined,
    config: Visualisation["config"] | undefined,
) {
    if (!config) {
        return undefined;
    }

    return saveConfigObject({
        colorMapping: saveConfigObject(saveColorMapping(config.colors ?? {})),
        continuousLine: saveConfigObject({
            enabled: getValueOrDefault(config.continuous_line, DEFAULTS.continuousLine.enabled, "bool"),
        }),
        distinctPointShapes: saveConfigObject({
            enabled: getValueOrDefault(
                config.distinct_point_shapes?.enabled,
                DEFAULTS.distinctPointShapes.enabled,
                "bool",
            ),
            pointShapeMapping:
                config.distinct_point_shapes?.point_shape_mapping ??
                DEFAULTS.distinctPointShapes.pointShapeMapping,
        }),
        dataLabels: saveConfigObject({
            visible: getValueOrDefault(config.data_labels, DEFAULTS.dataLabels.visible, "bool_auto"),
            style: getValueOrDefault(config.data_labels_style, DEFAULTS.dataLabels.style),
        }),
        dataPoints: saveConfigObject({
            visible: getValueOrDefault(config.data_points, DEFAULTS.dataPoints.visible, "bool_auto"),
        }),
        legend: saveConfigObject({
            enabled: getValueOrDefault(config.legend_enabled, DEFAULTS.legend.enabled, "bool"),
            position: getValueOrDefault(config.legend_position, DEFAULTS.legend.position),
        }),
        xaxis: saveConfigObject({
            name: saveConfigObject({
                position: getValueOrDefault(config.xaxis_name_position, DEFAULTS.xaxis.name.position),
                visible: getValueOrDefault(config.xaxis_name_visible, DEFAULTS.xaxis.name.visible, "bool"),
            }),
            rotation: getValueOrDefault(config.xaxis_rotation, DEFAULTS.xaxis.rotation),
            visible: getValueOrDefault(config.xaxis_visible, DEFAULTS.xaxis.visible, "bool"),
            labelsEnabled: getValueOrDefault(config.xaxis_labels, DEFAULTS.xaxis.labelsEnabled, "bool"),
        }),
        yaxis: saveConfigObject({
            format: getValueOrDefault(config.yaxis_format, DEFAULTS.yaxis.format),
            max: getValueOrDefault(config.yaxis_max, DEFAULTS.yaxis.max),
            min: getValueOrDefault(config.yaxis_min, DEFAULTS.yaxis.min),
            name: saveConfigObject({
                position: getValueOrDefault(config.yaxis_name_position, DEFAULTS.yaxis.name.position),
                visible: getValueOrDefault(config.yaxis_name_visible, DEFAULTS.yaxis.name.visible, "bool"),
            }),
            rotation: getValueOrDefault(config.yaxis_rotation, DEFAULTS.yaxis.rotation),
            visible: getValueOrDefault(config.yaxis_visible, DEFAULTS.yaxis.visible, "bool"),
            labelsEnabled: getValueOrDefault(config.yaxis_labels, DEFAULTS.yaxis.labelsEnabled, "bool"),
        }),
        grid: saveConfigObject({
            enabled: getValueOrDefault(config.grid_enabled, DEFAULTS.grid.enabled, "bool"),
        }),
        forecast: saveConfigObject({
            enabled: getValueOrDefault(config.forecast_enabled, DEFAULTS.forecast.enabled, "bool"),
            confidence: getValueOrDefault(config.forecast_confidence, DEFAULTS.forecast.confidence, "number"),
            period: getValueOrDefault(config.forecast_period, DEFAULTS.forecast.period, "number"),
            seasonal: getValueOrDefault(config.forecast_seasonal, DEFAULTS.forecast.seasonal, "bool"),
        }),
        anomalies: saveConfigObject({
            enabled: getValueOrDefault(config.anomaly_detection_enabled, DEFAULTS.anomalies.enabled, "bool"),
            sensitivity: getValueOrDefault(
                config.anomaly_detection_sensitivity,
                DEFAULTS.anomalies.sensitivity,
            ),
            size: getValueOrDefault(config.anomaly_detection_size, DEFAULTS.anomalies.size),
            color: getValueOrDefault(config.anomaly_detection_color, DEFAULTS.anomalies.color),
        }),
        disableDrillDown: getValueOrDefault(config.disable_drill_down, DEFAULTS.disableDrillDown, "bool"),
        disableDrillIntoURL:
            config.disable_drill_into_url === undefined ? undefined : !!config.disable_drill_into_url,
        disableAlerts: getValueOrDefault(config.disable_alerts, DEFAULTS.disableAlerts, "bool"),
        disableScheduledExports: getValueOrDefault(
            config.disable_scheduled_exports,
            DEFAULTS.disableScheduledExports,
            "bool",
        ),
        disableKeyDriveAnalysisOn: saveConfigObject(config.disable_key_drive_analysis),
        customTooltip: saveConfigObject(saveCustomTooltip(config.custom_tooltip)),
        thresholdMeasures: getValueOrDefault(
            config.line_style_control_metrics,
            DEFAULTS.thresholdMeasures,
            "array",
        ),
        thresholdExcludedMeasures: getValueOrDefault(
            config.line_style_excluded_metrics,
            DEFAULTS.thresholdExcludedMeasures,
            "array",
        ),
        lineStyleMapping: saveLineStyleMapping(
            config["line_style_mapping"] as Record<string, { style?: string; width?: number }> | undefined,
        ),
    });
}

/**
 * @internal
 * @deprecated Use lineChartLoad and lineChartSave instead.
 */
export interface ILineChartConfig {
    load: typeof lineChartLoad;
    save: typeof lineChartSave;
    DEFAULTS: ConfigDefaults<LineChartConfigProperties>;
}

/**
 * @internal
 * @deprecated Use lineChartLoad and lineChartSave instead.
 */
export const lineChart: ILineChartConfig = {
    load: lineChartLoad,
    save: lineChartSave,
    DEFAULTS,
};
