// (C) 2023-2026 GoodData Corporation

import type { Visualisation } from "@gooddata/sdk-code-schemas/v1";

import {
    loadChartFill,
    loadColorMapping,
    loadDisableKda,
    saveChartFill,
    saveColorMapping,
} from "../utils/configUtils.js";

import { type ChartFillType, type ColorMapping, type PatternFillName } from "./types.js";
import {
    type ConfigDefaults,
    type VisualisationConfig,
    getValueOrDefault,
    loadConfig,
    saveConfigObject,
} from "./utils.js";

/** @internal */
export type DonutChartConfigProperties = {
    colorMapping: Array<ColorMapping>;
    dataLabels: {
        visible: boolean | "auto";
        style: "auto" | "backplate";
    };
    chartFill: {
        type: ChartFillType;
        measureToPatternName?: Record<string, PatternFillName>;
    };
    legend: {
        enabled: boolean;
        position: "top" | "bottom" | "left" | "right" | "auto";
    };
    disableDrillDown: boolean;
    disableDrillIntoURL: boolean;
    disableAlerts: boolean;
    disableScheduledExports: boolean;
    disableKeyDriveAnalysisOn: Record<string, boolean>;
};

/** @internal */
const DEFAULTS: ConfigDefaults<DonutChartConfigProperties> = {
    colorMapping: [],
    dataLabels: {
        visible: false,
        style: "auto",
    },
    chartFill: {
        type: "solid",
    },
    legend: {
        enabled: true,
        position: "auto",
    },
    disableDrillDown: false,
    disableDrillIntoURL: false,
    disableAlerts: false,
    disableScheduledExports: false,
    disableKeyDriveAnalysisOn: {},
};

/** @internal */
export const DONUT_CHART_DEFAULTS = DEFAULTS;

/** @internal */
export function donutChartLoad(props: VisualisationConfig<DonutChartConfigProperties>) {
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
            case "chartFill": {
                return [
                    [
                        "chart_fill",
                        loadChartFill(value as (typeof DEFAULTS)["chartFill"], DEFAULTS.chartFill),
                    ],
                ];
            }
            case "legend": {
                const val = value as (typeof DEFAULTS)["legend"];
                return [
                    ["legend_enabled", getValueOrDefault(val.enabled, DEFAULTS.legend.enabled, "bool")],
                    ["legend_position", getValueOrDefault(val.position, DEFAULTS.legend.position)],
                ];
            }
            case "disableDrillDown":
                return [
                    [
                        "disable_drill_down",
                        getValueOrDefault(value as boolean, DEFAULTS.disableDrillDown, "bool"),
                    ],
                ];
            case "disableDrillIntoURL":
                // Org-specific default (enableDrillToUrlByDefault); always serialise when set so it round-trips.
                return [["disable_drill_into_url", value === undefined ? undefined : !!value]];
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
            case "disableKeyDriveAnalysisOn":
                return [["disable_key_drive_analysis", loadDisableKda(value as Record<string, boolean>)]];
            default:
                return [];
        }
    });
}

/** @internal */
export function donutChartSave(
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
        chartFill: saveConfigObject(saveChartFill(config, DEFAULTS.chartFill)),
        legend: saveConfigObject({
            enabled: getValueOrDefault(config.legend_enabled, DEFAULTS.legend.enabled, "bool"),
            position: getValueOrDefault(config.legend_position, DEFAULTS.legend.position),
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
    });
}

/**
 * @internal
 * @deprecated Use donutChartLoad and donutChartSave instead.
 */
export interface IDonutChartConfig {
    load: typeof donutChartLoad;
    save: typeof donutChartSave;
    DEFAULTS: ConfigDefaults<DonutChartConfigProperties>;
}

/**
 * @internal
 * @deprecated Use donutChartLoad and donutChartSave instead.
 */
export const donutChart: IDonutChartConfig = {
    load: donutChartLoad,
    save: donutChartSave,
    DEFAULTS,
};
