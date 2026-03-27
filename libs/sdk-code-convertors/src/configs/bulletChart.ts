// (C) 2023-2026 GoodData Corporation

import { type ChartFillType, type ColorMapping, type PatternFillName } from "./types.js";
import {
    type ConfigDefaults,
    type VisualisationConfig,
    getValueOrDefault,
    loadConfig,
    saveConfigObject,
} from "./utils.js";
import type { Visualisation } from "../schemas/v1/metadata.js";
import { loadChartFill, loadColorMapping, saveChartFill, saveColorMapping } from "../utils/configUtils.js";

type DefaultProperties = {
    colorMapping: Array<ColorMapping>;
    legend: {
        enabled: boolean;
        position: "top" | "bottom" | "left" | "right" | "auto";
    };
    chartFill: {
        type: ChartFillType;
        measureToPatternName?: Record<string, PatternFillName>;
    };
    xaxis: {
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
    yaxis: {
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
    legend: {
        enabled: true,
        position: "auto",
    },
    chartFill: {
        type: "solid",
    },
    xaxis: {
        format: "auto",
        max: "",
        min: "",
        name: {
            visible: true,
            position: "auto",
        },
        labelsEnabled: true,
        rotation: "auto",
        visible: false,
    },
    yaxis: {
        name: {
            visible: true,
            position: "auto",
        },
        labelsEnabled: true,
        rotation: "auto",
        visible: false,
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
            case "legend": {
                const val = value as (typeof DEFAULTS)["legend"];
                return [
                    ["legend_enabled", getValueOrDefault(val.enabled, DEFAULTS.legend.enabled, "bool")],
                    ["legend_position", getValueOrDefault(val.position, DEFAULTS.legend.position)],
                ];
            }
            case "chartFill": {
                return [
                    [
                        "chart_fill",
                        loadChartFill(value as (typeof DEFAULTS)["chartFill"], DEFAULTS.chartFill),
                    ],
                ];
            }
            case "xaxis": {
                const val = value as (typeof DEFAULTS)["xaxis"];
                return [
                    ["xaxis_format", getValueOrDefault(val.format, DEFAULTS.xaxis.format)],
                    ["xaxis_max", getValueOrDefault(val.max, DEFAULTS.xaxis.max, "number")],
                    ["xaxis_min", getValueOrDefault(val.min, DEFAULTS.xaxis.min, "number")],
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
                    [
                        "yaxis_name_position",
                        getValueOrDefault(val.name?.position, DEFAULTS.yaxis.name.position),
                    ],
                    [
                        "yaxis_name_visible",
                        getValueOrDefault(val.name?.visible, DEFAULTS.yaxis.name.visible, "bool"),
                    ],
                    [
                        "yaxis_labels",
                        getValueOrDefault(val.labelsEnabled, DEFAULTS.yaxis.labelsEnabled, "bool"),
                    ],
                    ["yaxis_rotation", getValueOrDefault(val.rotation, DEFAULTS.yaxis.rotation)],
                    ["yaxis_visible", getValueOrDefault(val.visible, DEFAULTS.yaxis.visible, "bool")],
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
        legend: saveConfigObject({
            enabled: getValueOrDefault(config.legend_enabled, DEFAULTS.legend.enabled, "bool"),
            position: getValueOrDefault(config.legend_position, DEFAULTS.legend.position),
        }),
        chartFill: saveConfigObject(saveChartFill(config, DEFAULTS.chartFill)),
        xaxis: saveConfigObject({
            format: getValueOrDefault(config.xaxis_format, DEFAULTS.xaxis.format),
            max: getValueOrDefault(config.xaxis_max, DEFAULTS.xaxis.max),
            min: getValueOrDefault(config.xaxis_min, DEFAULTS.xaxis.min),
            name: saveConfigObject({
                position: getValueOrDefault(config.xaxis_name_position, DEFAULTS.xaxis.name.position),
                visible: getValueOrDefault(config.xaxis_name_visible, DEFAULTS.xaxis.name.visible, "bool"),
            }),
            rotation: getValueOrDefault(config.xaxis_rotation, DEFAULTS.xaxis.rotation),
            visible: getValueOrDefault(config.xaxis_visible, DEFAULTS.xaxis.visible, "bool"),
            labelsEnabled: getValueOrDefault(config.xaxis_labels, DEFAULTS.xaxis.labelsEnabled, "bool"),
        }),
        yaxis: saveConfigObject({
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

export const bulletChart = {
    load,
    save,
    DEFAULTS,
};
