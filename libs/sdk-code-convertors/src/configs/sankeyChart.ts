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
export type SankeyChartConfigProperties = {
    colorMapping: Array<ColorMapping>;
    dataLabels: {
        visible: boolean | "auto";
        style: "auto" | "backplate";
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
    customTooltip: ICustomTooltip;
};

/** @internal */
const DEFAULTS: ConfigDefaults<SankeyChartConfigProperties> = {
    colorMapping: [],
    dataLabels: {
        visible: "auto",
        style: "auto",
    },
    legend: {
        enabled: false,
        position: "auto",
    },
    disableDrillDown: false,
    disableDrillIntoURL: false,
    disableAlerts: false,
    disableScheduledExports: false,
    disableKeyDriveAnalysisOn: {},
    customTooltip: DEFAULT_CUSTOM_TOOLTIP,
};

/** @internal */
export const SANKEY_CHART_DEFAULTS = DEFAULTS;

/** @internal */
export function sankeyChartLoad(props: VisualisationConfig<SankeyChartConfigProperties>) {
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
            case "customTooltip":
                return [["custom_tooltip", loadCustomTooltip(value as (typeof DEFAULTS)["customTooltip"])]];
            default:
                return [];
        }
    });
}

/** @internal */
export function sankeyChartSave(
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
        customTooltip: saveConfigObject(saveCustomTooltip(config.custom_tooltip)),
    });
}

/**
 * @internal
 * @deprecated Use sankeyChartLoad and sankeyChartSave instead.
 */
export interface ISankeyChartConfig {
    load: typeof sankeyChartLoad;
    save: typeof sankeyChartSave;
    DEFAULTS: ConfigDefaults<SankeyChartConfigProperties>;
}

/**
 * @internal
 * @deprecated Use sankeyChartLoad and sankeyChartSave instead.
 */
export const sankeyChart: ISankeyChartConfig = {
    load: sankeyChartLoad,
    save: sankeyChartSave,
    DEFAULTS,
};
