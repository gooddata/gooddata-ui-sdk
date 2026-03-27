// (C) 2023-2026 GoodData Corporation

import { type ColorMapping, type ColumnWidthItem } from "./types.js";
import {
    type ConfigDefaults,
    type VisualisationConfig,
    getValueOrDefault,
    loadConfig,
    saveConfigObject,
} from "./utils.js";
import type { Bucket, Visualisation } from "../schemas/v1/metadata.js";
import {
    loadColorMapping,
    loadColumnsWidth,
    saveColorMapping,
    saveColumnWidths,
} from "../utils/configUtils.js";
import { getFullBucket } from "../utils/sharedUtils.js";

type DefaultProperties = {
    colorMapping: Array<ColorMapping>;
    columnWidths: Array<ColumnWidthItem>;
    cellImageSizing: "fit" | "fill";
    cellTextWrapping: "clip" | "wrap";
    cellVerticalAlign: "top" | "middle" | "bottom";
    rowHeight: "small" | "medium" | "large";
    disableAlerts: boolean;
    disableScheduledExports: boolean;
};

export type InlineVisualizations = Record<
    string,
    {
        type: "metric" | "line" | "column";
    }
>;

const DEFAULTS: ConfigDefaults<DefaultProperties> = {
    colorMapping: [],
    columnWidths: [],
    rowHeight: "small",
    cellVerticalAlign: "top",
    cellTextWrapping: "clip",
    cellImageSizing: "fit",
    disableAlerts: false,
    disableScheduledExports: false,
};

function load(props: VisualisationConfig<DefaultProperties>) {
    return loadConfig(props, (key, value) => {
        switch (key) {
            case "columnWidths": {
                return [["widths", loadColumnsWidth(value as (typeof DEFAULTS)["columnWidths"])]];
            }
            case "colorMapping": {
                return [["colors", loadColorMapping(value as (typeof DEFAULTS)["colorMapping"])]];
            }
            case "rowHeight": {
                return [
                    [
                        "row_height",
                        getValueOrDefault(value as (typeof DEFAULTS)["rowHeight"], DEFAULTS.rowHeight),
                    ],
                ];
            }
            case "cellVerticalAlign": {
                return [
                    [
                        "cell_vertical_align",
                        getValueOrDefault(
                            value as (typeof DEFAULTS)["cellVerticalAlign"],
                            DEFAULTS.cellVerticalAlign,
                        ),
                    ],
                ];
            }
            case "cellTextWrapping": {
                return [
                    [
                        "cell_text_wrapping",
                        getValueOrDefault(
                            value as (typeof DEFAULTS)["cellTextWrapping"],
                            DEFAULTS.cellTextWrapping,
                        ),
                    ],
                ];
            }
            case "cellImageSizing": {
                return [
                    [
                        "cell_image_sizing",
                        getValueOrDefault(
                            value as (typeof DEFAULTS)["cellImageSizing"],
                            DEFAULTS.cellImageSizing,
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
    fields: Visualisation["query"]["fields"] | undefined,
    config: Visualisation["config"] | undefined,
) {
    if (!config) {
        return undefined;
    }

    return saveConfigObject({
        columnWidths: saveColumnWidths(fields || {}, config.widths),
        colorMapping: saveConfigObject(saveColorMapping(config.colors ?? {})),
        rowHeight: getValueOrDefault(config.row_height, DEFAULTS.rowHeight),
        cellVerticalAlign: getValueOrDefault(config.cell_vertical_align, DEFAULTS.cellVerticalAlign),
        cellTextWrapping: getValueOrDefault(config.cell_text_wrapping, DEFAULTS.cellTextWrapping),
        cellImageSizing: getValueOrDefault(config.cell_image_sizing, DEFAULTS.cellImageSizing),
        disableAlerts: getValueOrDefault(config.disable_alerts, DEFAULTS.disableAlerts, "bool"),
        disableScheduledExports: getValueOrDefault(
            config.disable_scheduled_exports,
            DEFAULTS.disableScheduledExports,
            "bool",
        ),
    });
}

function saveInlineVisualizations(metrics: Bucket[] = []) {
    return metrics?.reduce<InlineVisualizations>((map, b) => {
        const bucket = getFullBucket(b);
        if (bucket.display_as && bucket.field) {
            map[bucket.field] = {
                type: bucket.display_as,
            };
        }
        return map;
    }, {});
}

export const repeaterChart = {
    load,
    save,
    saveInlineVisualizations,
    DEFAULTS,
};
