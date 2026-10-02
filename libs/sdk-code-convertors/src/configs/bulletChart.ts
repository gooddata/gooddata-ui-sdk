// (C) 2023-2026 GoodData Corporation

import type { Visualisation } from "@gooddata/sdk-code-schemas/v1";

import {
    DEFAULT_CUSTOM_TOOLTIP,
    loadChartFill,
    loadColorMapping,
    loadCustomTooltip,
    loadDisableKda,
    saveChartFill,
    saveColorMapping,
    saveCustomTooltip,
} from "../utils/configUtils.js";

import { type ChartFillType, type ColorMapping, type ICustomTooltip, type PatternFillName } from "./types.js";
import {
    type ConfigDefaults,
    type VisualisationConfig,
    getValueOrDefault,
    loadConfig,
    saveConfigObject,
} from "./utils.js";

/** @internal */
export type BulletChartConfigProperties = {
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
    disableDrillIntoURL: boolean;
    disableAlerts: boolean;
    disableScheduledExports: boolean;
    disableKeyDriveAnalysisOn: Record<string, boolean>;
    customTooltip: ICustomTooltip;
};

/** @internal */
const DEFAULTS: ConfigDefaults<BulletChartConfigProperties> = {
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
    disableDrillIntoURL: false,
    disableAlerts: false,
    disableScheduledExports: false,
    disableKeyDriveAnalysisOn: {},
    customTooltip: DEFAULT_CUSTOM_TOOLTIP,
};

/** @internal */
export const BULLET_CHART_DEFAULTS = DEFAULTS;

/** @internal */
export function bulletChartLoad(props: VisualisationConfig<BulletChartConfigProperties>) {
    return loadConfig(props, (key, value) => {
        switch (key) {
            case "colorMapping":
                return [["colors", loadColorMapping(value)]];
            case "legend": {
                return [
                    ["legend_enabled", getValueOrDefault(value.enabled, DEFAULTS.legend.enabled, "bool")],
                    ["legend_position", getValueOrDefault(value.position, DEFAULTS.legend.position)],
                ];
            }
            case "chartFill": {
                return [["chart_fill", loadChartFill(value, DEFAULTS.chartFill)]];
            }
            case "xaxis": {
                return [
                    ["xaxis_format", getValueOrDefault(value.format, DEFAULTS.xaxis.format)],
                    ["xaxis_max", getValueOrDefault(value.max, DEFAULTS.xaxis.max, "number")],
                    ["xaxis_min", getValueOrDefault(value.min, DEFAULTS.xaxis.min, "number")],
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
                    [
                        "yaxis_name_position",
                        getValueOrDefault(value.name?.position, DEFAULTS.yaxis.name.position),
                    ],
                    [
                        "yaxis_name_visible",
                        getValueOrDefault(value.name?.visible, DEFAULTS.yaxis.name.visible, "bool"),
                    ],
                    [
                        "yaxis_labels",
                        getValueOrDefault(value.labelsEnabled, DEFAULTS.yaxis.labelsEnabled, "bool"),
                    ],
                    ["yaxis_rotation", getValueOrDefault(value.rotation, DEFAULTS.yaxis.rotation)],
                    ["yaxis_visible", getValueOrDefault(value.visible, DEFAULTS.yaxis.visible, "bool")],
                ];
            }
            case "grid": {
                return [["grid_enabled", getValueOrDefault(value.enabled, DEFAULTS.grid.enabled, "bool")]];
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
            default:
                key satisfies never; // Check that no key is forgotten in the cases above
                return [];
        }
    });
}

/** @internal */
export function bulletChartSave(
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
    });
}

/**
 * @internal
 * @deprecated Use bulletChartLoad and bulletChartSave instead.
 */
export interface IBulletChartConfig {
    load: typeof bulletChartLoad;
    save: typeof bulletChartSave;
    DEFAULTS: ConfigDefaults<BulletChartConfigProperties>;
}

/**
 * @internal
 * @deprecated Use bulletChartLoad and bulletChartSave instead.
 */
export const bulletChart: IBulletChartConfig = {
    load: bulletChartLoad,
    save: bulletChartSave,
    DEFAULTS,
};
