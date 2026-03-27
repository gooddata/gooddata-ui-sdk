// (C) 2023-2026 GoodData Corporation

import type { Visualisation } from "@gooddata/sdk-code-schemas/v1";

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
import { loadChartFill, loadColorMapping, saveChartFill, saveColorMapping } from "../utils/configUtils.js";

type DefaultProperties = {
    colorMapping: Array<ColorMapping>;
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
    grid: {
        enabled: boolean;
    };
    disableDrillDown: boolean;
    disableAlerts: boolean;
    disableScheduledExports: boolean;
};

const DEFAULTS: ConfigDefaults<DefaultProperties> = {
    colorMapping: [],
    distinctPointShapes: {
        enabled: false,
    },
    chartFill: {
        type: "solid",
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
    stackMeasures: false,
    stackMeasuresToPercent: false,
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
    disableDrillDown: false,
    disableAlerts: false,
    disableScheduledExports: false,
};

function load(props: VisualisationConfig<DefaultProperties>) {
    return loadConfig(props, (key, value) => {
        switch (key) {
            case "colorMapping":
                return [["colors", loadColorMapping(value as (typeof DEFAULTS)["colorMapping"])]];
            case "dataLabels": {
                const val = value as (typeof DEFAULTS)["dataLabels"];
                return [
                    ["data_labels", getValueOrDefault(val.visible, DEFAULTS.dataLabels.visible, "bool_auto")],
                    ["data_labels_style", getValueOrDefault(val.style, DEFAULTS.dataLabels.style)],
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
        disableDrillDown: getValueOrDefault(config.disable_drill_down, DEFAULTS.disableDrillDown, "bool"),
        disableAlerts: getValueOrDefault(config.disable_alerts, DEFAULTS.disableAlerts, "bool"),
        disableScheduledExports: getValueOrDefault(
            config.disable_scheduled_exports,
            DEFAULTS.disableScheduledExports,
            "bool",
        ),
    });
}

export const areaChart = {
    load,
    save,
    DEFAULTS,
};
