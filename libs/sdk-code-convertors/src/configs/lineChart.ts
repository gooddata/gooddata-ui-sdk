// (C) 2023-2026 GoodData Corporation

import { type ColorMapping, type PointShapeSymbol } from "./types.js";
import {
    type ConfigDefaults,
    type VisualisationConfig,
    getValueOrDefault,
    loadConfig,
    saveConfigObject,
} from "./utils.js";
import type { Visualisation } from "../schemas/v1/metadata.js";
import { loadColorMapping, saveColorMapping } from "../utils/configUtils.js";

type DefaultProperties = {
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
    disableAlerts: boolean;
    disableScheduledExports: boolean;
    thresholdMeasures: string[];
    thresholdExcludedMeasures: string[];
};

const DEFAULTS: ConfigDefaults<DefaultProperties> = {
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
    disableAlerts: false,
    disableScheduledExports: false,
    thresholdMeasures: [],
    thresholdExcludedMeasures: [],
};

function load(props: VisualisationConfig<DefaultProperties>) {
    return loadConfig(props, (key, value) => {
        switch (key) {
            case "colorMapping":
                return [["colors", loadColorMapping(value as (typeof DEFAULTS)["colorMapping"])]];
            case "continuousLine": {
                const val = value as (typeof DEFAULTS)["continuousLine"];
                return [
                    [
                        "continuous_line",
                        getValueOrDefault(val.enabled, DEFAULTS.continuousLine.enabled, "bool"),
                    ],
                ];
            }
            case "distinctPointShapes": {
                const val = value as (typeof DEFAULTS)["distinctPointShapes"];
                const distinctPointShapes = {
                    enabled: getValueOrDefault(val.enabled, DEFAULTS.distinctPointShapes.enabled, "bool"),
                    point_shape_mapping:
                        val.pointShapeMapping ?? DEFAULTS.distinctPointShapes.pointShapeMapping,
                };
                return [["distinct_point_shapes", distinctPointShapes]];
            }
            case "dataLabels": {
                const val = value as (typeof DEFAULTS)["dataLabels"];
                return [
                    ["data_labels", getValueOrDefault(val.visible, DEFAULTS.dataLabels.visible, "bool_auto")],
                    ["data_labels_style", getValueOrDefault(val.style, DEFAULTS.dataLabels.style)],
                ];
            }
            case "dataPoints": {
                const val = value as (typeof DEFAULTS)["dataPoints"];
                return [
                    ["data_points", getValueOrDefault(val.visible, DEFAULTS.dataPoints.visible, "bool_auto")],
                ];
            }
            case "legend": {
                const val = value as (typeof DEFAULTS)["legend"];
                return [
                    ["legend_enabled", getValueOrDefault(val.enabled, DEFAULTS.legend.enabled, "bool")],
                    ["legend_position", getValueOrDefault(val.position, DEFAULTS.legend.position)],
                ];
            }
            case "xaxis": {
                const val = value as (typeof DEFAULTS)["xaxis"];
                return [
                    [
                        "xaxis_name_position",
                        getValueOrDefault(val.name?.position, DEFAULTS.xaxis.name.position),
                    ],
                    [
                        "xaxis_name_visible",
                        getValueOrDefault(val.name?.visible, DEFAULTS.xaxis.name.visible, "bool"),
                    ],
                    ["xaxis_rotation", getValueOrDefault(val.rotation, DEFAULTS.xaxis.rotation)],
                    ["xaxis_visible", getValueOrDefault(val.visible, DEFAULTS.xaxis.visible, "bool")],
                    [
                        "xaxis_labels",
                        getValueOrDefault(val.labelsEnabled, DEFAULTS.xaxis.labelsEnabled, "bool"),
                    ],
                ];
            }
            case "yaxis": {
                const val = value as (typeof DEFAULTS)["yaxis"];
                return [
                    ["yaxis_format", getValueOrDefault(val.format, DEFAULTS.yaxis.format)],
                    ["yaxis_max", getValueOrDefault(val.max, DEFAULTS.yaxis.max, "number")],
                    ["yaxis_min", getValueOrDefault(val.min, DEFAULTS.yaxis.min, "number")],
                    [
                        "yaxis_name_position",
                        getValueOrDefault(val.name?.position, DEFAULTS.yaxis.name.position),
                    ],
                    [
                        "yaxis_name_visible",
                        getValueOrDefault(val.name?.visible, DEFAULTS.yaxis.name.visible, "bool"),
                    ],
                    ["yaxis_rotation", getValueOrDefault(val.rotation, DEFAULTS.yaxis.rotation)],
                    ["yaxis_visible", getValueOrDefault(val.visible, DEFAULTS.yaxis.visible, "bool")],
                    [
                        "yaxis_labels",
                        getValueOrDefault(val.labelsEnabled, DEFAULTS.yaxis.labelsEnabled, "bool"),
                    ],
                ];
            }
            case "grid": {
                const val = value as (typeof DEFAULTS)["grid"];
                return [["grid_enabled", getValueOrDefault(val.enabled, DEFAULTS.grid.enabled, "bool")]];
            }
            case "forecast": {
                const val = value as (typeof DEFAULTS)["forecast"];
                return [
                    ["forecast_enabled", getValueOrDefault(val.enabled, DEFAULTS.forecast.enabled, "bool")],
                    [
                        "forecast_confidence",
                        getValueOrDefault(val.confidence, DEFAULTS.forecast.confidence, "number"),
                    ],
                    ["forecast_period", getValueOrDefault(val.period, DEFAULTS.forecast.period, "number")],
                    [
                        "forecast_seasonal",
                        getValueOrDefault(val.seasonal, DEFAULTS.forecast.seasonal, "bool"),
                    ],
                ];
            }
            case "anomalies": {
                const val = value as (typeof DEFAULTS)["anomalies"];
                return [
                    [
                        "anomaly_detection_enabled",
                        getValueOrDefault(val.enabled, DEFAULTS.anomalies.enabled, "bool"),
                    ],
                    [
                        "anomaly_detection_sensitivity",
                        getValueOrDefault(val.sensitivity, DEFAULTS.anomalies.sensitivity),
                    ],
                    ["anomaly_detection_size", getValueOrDefault(val.size, DEFAULTS.anomalies.size)],
                    ["anomaly_detection_color", getValueOrDefault(val.color, DEFAULTS.anomalies.color)],
                ];
            }
            case "disableDrillDown":
                return [
                    [
                        "disable_drill_down",
                        getValueOrDefault(value as boolean, DEFAULTS.disableDrillDown, "bool"),
                    ],
                ];
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
            case "thresholdMeasures": {
                return [
                    [
                        "line_style_control_metrics",
                        getValueOrDefault(value as string[], DEFAULTS.thresholdMeasures, "array"),
                    ],
                ];
            }
            case "thresholdExcludedMeasures": {
                return [
                    [
                        "line_style_excluded_metrics",
                        getValueOrDefault(value as string[], DEFAULTS.thresholdExcludedMeasures, "array"),
                    ],
                ];
            }
            default:
                return [];
        }
    });
}

function save(
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
        disableAlerts: getValueOrDefault(config.disable_alerts, DEFAULTS.disableAlerts, "bool"),
        disableScheduledExports: getValueOrDefault(
            config.disable_scheduled_exports,
            DEFAULTS.disableScheduledExports,
            "bool",
        ),
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
    });
}

export const lineChart = {
    load,
    save,
    DEFAULTS,
};
