// (C) 2023-2026 GoodData Corporation

import { type ColorMapping } from "./types.js";
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
    dataLabels: {
        visible: boolean | "auto";
        style: "auto" | "backplate";
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
    clustering: {
        enabled: boolean;
        numberOfClusters: number;
        threshold: number;
    };
    disableDrillDown: boolean;
    disableAlerts: boolean;
    disableScheduledExports: boolean;
};

const DEFAULTS: ConfigDefaults<DefaultProperties> = {
    colorMapping: [],
    dataLabels: {
        visible: false,
        style: "auto",
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
    clustering: {
        enabled: false,
        numberOfClusters: 3,
        threshold: 0.03,
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
            case "clustering": {
                const val = value as (typeof DEFAULTS)["clustering"];
                return [
                    [
                        "clustering_enabled",
                        getValueOrDefault(val.enabled, DEFAULTS.clustering.enabled, "bool"),
                    ],
                    [
                        "clustering_amount",
                        getValueOrDefault(
                            val.numberOfClusters,
                            DEFAULTS.clustering.numberOfClusters,
                            "number",
                        ),
                    ],
                    [
                        "clustering_threshold",
                        getValueOrDefault(val.threshold, DEFAULTS.clustering.threshold, "number"),
                    ],
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
        dataLabels: saveConfigObject({
            visible: getValueOrDefault(config.data_labels, DEFAULTS.dataLabels.visible, "bool_auto"),
            style: getValueOrDefault(config.data_labels_style, DEFAULTS.dataLabels.style),
        }),
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
        clustering: saveConfigObject({
            enabled: getValueOrDefault(config.clustering_enabled, DEFAULTS.clustering.enabled, "bool"),
            numberOfClusters: getValueOrDefault(
                config.clustering_amount,
                DEFAULTS.clustering.numberOfClusters,
                "number",
            ),
            threshold: getValueOrDefault(
                config.clustering_threshold,
                DEFAULTS.clustering.threshold,
                "number",
            ),
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

export const scatterChart = {
    load,
    save,
    DEFAULTS,
};
