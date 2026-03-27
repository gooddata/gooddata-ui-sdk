// (C) 2023-2026 GoodData Corporation

import {
    type ChartFillType,
    type ColorMapping,
    type PatternFillName,
    type PointShapeSymbol,
} from "./types.js";
import {
    type ConfigDefaults,
    type VisualisationConfig,
    getValueOrDefault,
    loadConfig,
    saveConfigObject,
} from "./utils.js";
import type { Bucket, Visualisation } from "../schemas/v1/metadata.js";
import { loadChartFill, loadColorMapping, saveChartFill, saveColorMapping } from "../utils/configUtils.js";
import { getFullBucket } from "../utils/sharedUtils.js";

type DefaultProperties = {
    colorMapping: Array<ColorMapping>;
    continuousLine: {
        enabled: boolean;
    };
    distinctPointShapes: {
        enabled: boolean;
        pointShapeMapping?: Record<string, PointShapeSymbol>;
    };
    chartFill: {
        type: ChartFillType;
        measureToPatternName?: Record<string, PatternFillName>;
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
    dualAxis: boolean;
    primaryChartType: "column" | "area" | "line";
    secondaryChartType: "column" | "area" | "line";
    stackMeasures: boolean;
    stackMeasuresToPercent: boolean;
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
    secondary_yaxis: {
        measures: string[];
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
    chartFill: {
        type: "solid",
    },
    dataPoints: {
        visible: "auto",
    },
    dataLabels: {
        visible: "auto",
        style: "auto",
    },
    legend: {
        enabled: true,
        position: "auto",
    },
    dualAxis: true,
    stackMeasures: false,
    stackMeasuresToPercent: false,
    primaryChartType: "column",
    secondaryChartType: "line",
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
    secondary_yaxis: {
        measures: [],
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
            case "chartFill": {
                return [
                    [
                        "chart_fill",
                        loadChartFill(value as (typeof DEFAULTS)["chartFill"], DEFAULTS.chartFill),
                    ],
                ];
            }
            case "dataPoints": {
                const val = value as (typeof DEFAULTS)["dataPoints"];
                return [
                    ["data_points", getValueOrDefault(val.visible, DEFAULTS.dataPoints.visible, "bool_auto")],
                ];
            }
            case "dataLabels": {
                const val = value as (typeof DEFAULTS)["dataLabels"];
                return [
                    ["data_labels", getValueOrDefault(val.visible, DEFAULTS.dataLabels.visible, "bool_auto")],
                    ["data_labels_style", getValueOrDefault(val.style, DEFAULTS.dataLabels.style)],
                ];
            }
            case "legend": {
                const val = value as (typeof DEFAULTS)["legend"];
                return [
                    ["legend_enabled", getValueOrDefault(val.enabled, DEFAULTS.legend.enabled, "bool")],
                    ["legend_position", getValueOrDefault(val.position, DEFAULTS.legend.position)],
                ];
            }
            case "stackMeasuresToPercent":
                return [
                    [
                        "stack_measures_to_100",
                        getValueOrDefault(value as boolean, DEFAULTS.stackMeasuresToPercent, "bool"),
                    ],
                ];
            case "stackMeasures":
                return [
                    ["stack_measures", getValueOrDefault(value as boolean, DEFAULTS.stackMeasures, "bool")],
                ];
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
            case "primaryChartType":
                return [
                    ["yaxis_primary_type", getValueOrDefault(value as string, DEFAULTS.primaryChartType)],
                ];
            case "yaxis": {
                const val = value as (typeof DEFAULTS)["yaxis"];
                return [
                    ["yaxis_primary_format", getValueOrDefault(val.format, DEFAULTS.yaxis.format)],
                    ["yaxis_primary_max", getValueOrDefault(val.max, DEFAULTS.yaxis.max, "number")],
                    ["yaxis_primary_min", getValueOrDefault(val.min, DEFAULTS.yaxis.min, "number")],
                    [
                        "yaxis_primary_name_position",
                        getValueOrDefault(val.name?.position, DEFAULTS.yaxis.name.position),
                    ],
                    [
                        "yaxis_primary_name_visible",
                        getValueOrDefault(val.name?.visible, DEFAULTS.yaxis.name.visible, "bool"),
                    ],
                    ["yaxis_primary_rotation", getValueOrDefault(val.rotation, DEFAULTS.yaxis.rotation)],
                    ["yaxis_primary_visible", getValueOrDefault(val.visible, DEFAULTS.yaxis.visible, "bool")],
                    [
                        "yaxis_primary_labels",
                        getValueOrDefault(val.labelsEnabled, DEFAULTS.yaxis.labelsEnabled, "bool"),
                    ],
                ];
            }
            case "secondaryChartType":
                return [
                    ["yaxis_secondary_type", getValueOrDefault(value as string, DEFAULTS.secondaryChartType)],
                ];
            case "secondary_yaxis": {
                const val = value as (typeof DEFAULTS)["yaxis"];
                return [
                    [
                        "yaxis_secondary_format",
                        getValueOrDefault(val.format, DEFAULTS.secondary_yaxis.format),
                    ],
                    [
                        "yaxis_secondary_max",
                        getValueOrDefault(val.max, DEFAULTS.secondary_yaxis.max, "number"),
                    ],
                    [
                        "yaxis_secondary_min",
                        getValueOrDefault(val.min, DEFAULTS.secondary_yaxis.min, "number"),
                    ],
                    [
                        "yaxis_secondary_name_position",
                        getValueOrDefault(val.name?.position, DEFAULTS.secondary_yaxis.name.position),
                    ],
                    [
                        "yaxis_secondary_name_visible",
                        getValueOrDefault(val.name?.visible, DEFAULTS.secondary_yaxis.name.visible, "bool"),
                    ],
                    [
                        "yaxis_secondary_rotation",
                        getValueOrDefault(val.rotation, DEFAULTS.secondary_yaxis.rotation),
                    ],
                    [
                        "yaxis_secondary_visible",
                        getValueOrDefault(val.visible, DEFAULTS.secondary_yaxis.visible, "bool"),
                    ],
                    [
                        "yaxis_secondary_labels",
                        getValueOrDefault(val.labelsEnabled, DEFAULTS.secondary_yaxis.labelsEnabled, "bool"),
                    ],
                ];
            }
            case "dualAxis": {
                const val = value as (typeof DEFAULTS)["dualAxis"];
                return [["yaxis_secondary_show_on_right", getValueOrDefault(val, DEFAULTS.dualAxis, "bool")]];
            }
            case "grid": {
                const val = value as (typeof DEFAULTS)["grid"];
                return [["grid_enabled", getValueOrDefault(val.enabled, DEFAULTS.grid.enabled, "bool")]];
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
    buckets: Bucket[] = [],
) {
    if (!config) {
        return undefined;
    }

    const measures = buckets
        .map((b) => {
            const bucket = getFullBucket(b);
            return bucket.axis === "secondary" ? bucket.field : null;
        })
        .filter(Boolean) as string[];

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
        chartFill: saveConfigObject(saveChartFill(config, DEFAULTS.chartFill)),
        dataPoints: saveConfigObject({
            visible: getValueOrDefault(config.data_points, DEFAULTS.dataPoints.visible, "bool_auto"),
        }),
        dataLabels: saveConfigObject({
            visible: getValueOrDefault(config.data_labels, DEFAULTS.dataLabels.visible, "bool_auto"),
            style: getValueOrDefault(config.data_labels_style, DEFAULTS.dataLabels.style),
        }),
        legend: saveConfigObject({
            enabled: getValueOrDefault(config.legend_enabled, DEFAULTS.legend.enabled, "bool"),
            position: getValueOrDefault(config.legend_position, DEFAULTS.legend.position),
        }),
        stackMeasuresToPercent: getValueOrDefault(
            config.stack_measures_to_100,
            DEFAULTS.stackMeasuresToPercent,
            "bool",
        ),
        stackMeasures: getValueOrDefault(config.stack_measures, DEFAULTS.stackMeasures, "bool"),
        xaxis: saveConfigObject({
            name: saveConfigObject({
                position: getValueOrDefault(config.xaxis_name_position, DEFAULTS.xaxis.name.position),
                visible: getValueOrDefault(config.xaxis_name_visible, DEFAULTS.xaxis.name.visible, "bool"),
            }),
            rotation: getValueOrDefault(config.xaxis_rotation, DEFAULTS.xaxis.rotation),
            visible: getValueOrDefault(config.xaxis_visible, DEFAULTS.xaxis.visible, "bool"),
            labelsEnabled: getValueOrDefault(config.xaxis_labels, DEFAULTS.xaxis.labelsEnabled, "bool"),
        }),
        primaryChartType: getValueOrDefault(config.yaxis_primary_type, DEFAULTS.primaryChartType),
        yaxis: saveConfigObject({
            format: getValueOrDefault(
                config.yaxis_primary_format ?? config.yaxis_format,
                DEFAULTS.yaxis.format,
            ),
            max: getValueOrDefault(config.yaxis_primary_max ?? config.yaxis_max, DEFAULTS.yaxis.max),
            min: getValueOrDefault(config.yaxis_primary_min ?? config.yaxis_min, DEFAULTS.yaxis.min),
            name: saveConfigObject({
                position: getValueOrDefault(
                    config.yaxis_primary_name_position ?? config.yaxis_name_position,
                    DEFAULTS.yaxis.name.position,
                ),
                visible: getValueOrDefault(
                    config.yaxis_primary_name_visible ?? config.yaxis_name_visible,
                    DEFAULTS.yaxis.name.visible,
                    "bool",
                ),
            }),
            rotation: getValueOrDefault(
                config.yaxis_primary_rotation ?? config.yaxis_rotation,
                DEFAULTS.yaxis.rotation,
            ),
            visible: getValueOrDefault(
                config.yaxis_primary_visible ?? config.yaxis_visible,
                DEFAULTS.yaxis.visible,
                "bool",
            ),
            labelsEnabled: getValueOrDefault(
                config.yaxis_primary_labels ?? config.yaxis_labels,
                DEFAULTS.yaxis.labelsEnabled,
                "bool",
            ),
        }),
        secondaryChartType: getValueOrDefault(config.yaxis_secondary_type, DEFAULTS.secondaryChartType),
        secondary_yaxis: saveConfigObject({
            measures: measures.length > 0 ? measures : undefined,
            format: getValueOrDefault(config.yaxis_secondary_format, DEFAULTS.secondary_yaxis.format),
            max: getValueOrDefault(config.yaxis_secondary_max, DEFAULTS.secondary_yaxis.max),
            min: getValueOrDefault(config.yaxis_secondary_min, DEFAULTS.secondary_yaxis.min),
            name: saveConfigObject({
                position: getValueOrDefault(
                    config.yaxis_secondary_name_position,
                    DEFAULTS.secondary_yaxis.name.position,
                ),
                visible: getValueOrDefault(
                    config.yaxis_secondary_name_visible,
                    DEFAULTS.secondary_yaxis.name.visible,
                    "bool",
                ),
            }),
            rotation: getValueOrDefault(config.yaxis_secondary_rotation, DEFAULTS.secondary_yaxis.rotation),
            visible: getValueOrDefault(
                config.yaxis_secondary_visible,
                DEFAULTS.secondary_yaxis.visible,
                "bool",
            ),
            labelsEnabled: getValueOrDefault(
                config.yaxis_secondary_labels,
                DEFAULTS.secondary_yaxis.labelsEnabled,
                "bool",
            ),
        }),
        dualAxis: getValueOrDefault(config.yaxis_secondary_show_on_right, DEFAULTS.dualAxis, "bool"),
        grid: saveConfigObject({
            enabled: getValueOrDefault(config.grid_enabled, DEFAULTS.grid.enabled, "bool"),
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

export const comboChart = {
    load,
    save,
    DEFAULTS,
};
