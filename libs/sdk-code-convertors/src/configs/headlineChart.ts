// (C) 2023-2026 GoodData Corporation

import type { Visualisation } from "@gooddata/sdk-code-schemas/v1";

import { type ColorMapping } from "./types.js";
import {
    type ConfigDefaults,
    type VisualisationConfig,
    getValueOrDefault,
    loadConfig,
    saveConfigObject,
} from "./utils.js";
import { loadColor, saveColor } from "../utils/configUtils.js";

type DefaultProperties = {
    comparison: {
        enabled: boolean;
        calculationType: "change" | "change_difference" | "ratio" | "difference";
        format: "inherit" | string;
        position: "right" | "left" | "top" | "auto";
        isArrowEnabled: boolean;
        colorConfig?: {
            disabled: boolean;
            equals: ColorMapping["color"] | undefined;
            negative: ColorMapping["color"] | undefined;
            positive: ColorMapping["color"] | undefined;
        };
        labelConfig?: {
            isConditional: boolean;
            unconditionalValue: string;
            equals: string;
            negative: string;
            positive: string;
        };
    };
    disableAlerts: boolean;
    disableScheduledExports: boolean;
};

const DEFAULTS: ConfigDefaults<DefaultProperties> = {
    comparison: {
        calculationType: "ratio",
        format: "#,##0%",
        enabled: true,
        position: "auto",
        isArrowEnabled: false,
        labelConfig: {
            isConditional: false,
            unconditionalValue: "",
            equals: "",
            negative: "",
            positive: "",
        },
        colorConfig: {
            disabled: false,
            equals: undefined,
            negative: undefined,
            positive: undefined,
        },
    },
    disableAlerts: false,
    disableScheduledExports: false,
};

function load(props: VisualisationConfig<DefaultProperties>) {
    return loadConfig(props, (key, value) => {
        switch (key) {
            case "comparison": {
                const val = value as (typeof DEFAULTS)["comparison"];
                return [
                    [
                        "comparison_enabled",
                        getValueOrDefault(val.enabled, DEFAULTS.comparison.enabled, "bool"),
                    ],
                    [
                        "comparison_type",
                        getValueOrDefault(val.calculationType, DEFAULTS.comparison.calculationType),
                    ],
                    ["format", getValueOrDefault(val.format, DEFAULTS.comparison.format)],
                    ["position", getValueOrDefault(val.position, DEFAULTS.comparison.position)],
                    [
                        "indicator_arrow",
                        getValueOrDefault(val.isArrowEnabled, DEFAULTS.comparison.isArrowEnabled, "bool"),
                    ],
                    [
                        "indicator_colors",
                        val.colorConfig?.disabled === undefined ? undefined : !val.colorConfig.disabled,
                    ],
                    ["indicator_color_equals", loadColor("equals", val.colorConfig?.equals)?.value],
                    ["indicator_color_negative", loadColor("negative", val.colorConfig?.negative)?.value],
                    ["indicator_color_positive", loadColor("positive", val.colorConfig?.positive)?.value],
                    [
                        "label_default",
                        getValueOrDefault(
                            val.labelConfig?.unconditionalValue,
                            DEFAULTS.comparison.labelConfig!.unconditionalValue,
                        ),
                    ],
                    [
                        "label_conditional",
                        getValueOrDefault(
                            val.labelConfig?.isConditional,
                            DEFAULTS.comparison.labelConfig!.isConditional,
                            "bool",
                        ),
                    ],
                    [
                        "label_equals",
                        getValueOrDefault(val.labelConfig?.equals, DEFAULTS.comparison.labelConfig!.equals),
                    ],
                    [
                        "label_negative",
                        getValueOrDefault(
                            val.labelConfig?.negative,
                            DEFAULTS.comparison.labelConfig!.negative,
                        ),
                    ],
                    [
                        "label_positive",
                        getValueOrDefault(
                            val.labelConfig?.positive,
                            DEFAULTS.comparison.labelConfig!.positive,
                        ),
                    ],
                ];
            }
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
    config: Visualisation["config"] | undefined = {},
) {
    return saveConfigObject({
        comparison: saveConfigObject({
            calculationType: getValueOrDefault(config.comparison_type, DEFAULTS.comparison.calculationType),
            format: getValueOrDefault(config.format, DEFAULTS.comparison.format),
            enabled: getValueOrDefault(config.comparison_enabled, DEFAULTS.comparison.enabled, "bool", true),
            position: getValueOrDefault(config.position, DEFAULTS.comparison.position),
            isArrowEnabled: getValueOrDefault(
                config.indicator_arrow,
                DEFAULTS.comparison.isArrowEnabled,
                "bool",
            ),
            labelConfig: saveConfigObject({
                isConditional: getValueOrDefault(
                    config.label_conditional,
                    DEFAULTS.comparison.labelConfig!.isConditional,
                    "bool",
                ),
                unconditionalValue: getValueOrDefault(
                    config.label_default,
                    DEFAULTS.comparison.labelConfig!.unconditionalValue,
                ),
                equals: getValueOrDefault(config.label_equals, DEFAULTS.comparison.labelConfig!.equals),
                negative: getValueOrDefault(config.label_negative, DEFAULTS.comparison.labelConfig!.negative),
                positive: getValueOrDefault(config.label_positive, DEFAULTS.comparison.labelConfig!.positive),
            }),
            colorConfig: saveConfigObject({
                disabled: config.indicator_colors === undefined ? undefined : !config.indicator_colors,
                equals: saveColor("equals", config.indicator_color_equals, "enum")?.color,
                negative: saveColor("negative", config.indicator_color_negative, "enum")?.color,
                positive: saveColor("positive", config.indicator_color_positive, "enum")?.color,
            }),
        }),
        disableAlerts: getValueOrDefault(config.disable_alerts, DEFAULTS.disableAlerts, "bool"),
        disableScheduledExports: getValueOrDefault(
            config.disable_scheduled_exports,
            DEFAULTS.disableScheduledExports,
            "bool",
        ),
    });
}

export const headlineChart = {
    load,
    save,
    DEFAULTS,
};
