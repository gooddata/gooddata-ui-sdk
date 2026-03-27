// (C) 2023-2026 GoodData Corporation

import { type ColumnLocator, type ColumnWidthItem } from "./types.js";
import {
    type ConfigDefaults,
    type VisualisationConfig,
    getValueOrDefault,
    loadConfig,
    saveConfigObject,
} from "./utils.js";
import type { Visualisation } from "../schemas/v1/metadata.js";
import { loadColumnsWidth, saveColumnWidths } from "../utils/configUtils.js";

type DefaultProperties = {
    columnWidths: Array<ColumnWidthItem>;
    measureGroupDimension: "columns" | "rows";
    columnHeadersPosition: "top" | "left";
    disableDrillDown: boolean;
    disableDrillIntoURL: boolean;
    disableAlerts: boolean;
    disableScheduledExports: boolean;
    textWrapping: {
        wrapText: boolean;
        wrapHeaderText: boolean;
        columnOverrides: Array<{
            locators: ColumnLocator[];
            wrapText: boolean;
            wrapHeaderText: boolean;
            matchType: "column" | "pivotGroup";
        }>;
    };
    enableAccessibility: boolean;
    pagination: {
        enabled: boolean;
    };
    pageSize: number;
    grandTotalsPosition: "pinnedBottom" | "pinnedTop" | "bottom" | "top";
};

const DEFAULTS: ConfigDefaults<DefaultProperties> = {
    columnWidths: [],
    measureGroupDimension: "columns",
    columnHeadersPosition: "top",
    disableAlerts: false,
    disableDrillDown: false,
    disableDrillIntoURL: true,
    disableScheduledExports: false,
    textWrapping: {
        wrapText: false,
        wrapHeaderText: false,
        columnOverrides: [],
    },
    pagination: {
        enabled: false,
    },
    pageSize: 100,
    enableAccessibility: false,
    grandTotalsPosition: "pinnedBottom",
};

type TextWrapping = DefaultProperties["textWrapping"];
type TextWrappingOverride = TextWrapping["columnOverrides"][number];

function loadTextWrapping(value: TextWrapping | undefined): object | undefined {
    if (!value) {
        return undefined;
    }

    const overrides = value.columnOverrides ?? [];
    const hasOverrides = overrides.length > 0;
    const hasWrapText = value.wrapText !== undefined && value.wrapText !== DEFAULTS.textWrapping.wrapText;
    const hasWrapHeaderText =
        value.wrapHeaderText !== undefined && value.wrapHeaderText !== DEFAULTS.textWrapping.wrapHeaderText;

    if (!hasOverrides && !hasWrapText && !hasWrapHeaderText) {
        return undefined;
    }

    return {
        ...(hasWrapText ? { wrap_text: value.wrapText } : {}),
        ...(hasWrapHeaderText ? { wrap_header_text: value.wrapHeaderText } : {}),
        ...(hasOverrides
            ? {
                  column_overrides: overrides.map((override) => loadTextWrappingOverride(override)),
              }
            : {}),
    };
}

function loadTextWrappingOverride(override: TextWrappingOverride): object {
    return {
        locators: override.locators,
        ...(override.wrapText === undefined ? {} : { wrap_text: override.wrapText }),
        ...(override.wrapHeaderText === undefined ? {} : { wrap_header_text: override.wrapHeaderText }),
        ...(override.matchType ? { match_type: override.matchType } : {}),
    };
}

type YamlTextWrapping = {
    wrap_text?: boolean;
    wrap_header_text?: boolean;
    column_overrides?: Array<{
        locators?: ColumnLocator[];
        wrap_text?: boolean;
        wrap_header_text?: boolean;
        match_type?: "column" | "pivotGroup";
    }>;
};

function savePagination(value: boolean | undefined): { enabled: boolean } | undefined {
    const enabled = getValueOrDefault(value, DEFAULTS.pagination.enabled, "bool");
    return enabled === undefined ? undefined : { enabled };
}

function saveTextWrapping(value: YamlTextWrapping | undefined): TextWrapping | undefined {
    if (!value) {
        return undefined;
    }

    const overrides = value.column_overrides ?? [];
    const hasOverrides = overrides.length > 0;
    const hasWrapText = value.wrap_text !== undefined && value.wrap_text !== DEFAULTS.textWrapping.wrapText;
    const hasWrapHeaderText =
        value.wrap_header_text !== undefined &&
        value.wrap_header_text !== DEFAULTS.textWrapping.wrapHeaderText;

    if (!hasOverrides && !hasWrapText && !hasWrapHeaderText) {
        return undefined;
    }

    return {
        wrapText: value.wrap_text ?? DEFAULTS.textWrapping.wrapText,
        wrapHeaderText: value.wrap_header_text ?? DEFAULTS.textWrapping.wrapHeaderText,
        columnOverrides: overrides.map((override) => ({
            locators: override.locators ?? [],
            wrapText: override.wrap_text ?? false,
            wrapHeaderText: override.wrap_header_text ?? false,
            matchType: override.match_type ?? "column",
        })),
    };
}

function load(props: VisualisationConfig<DefaultProperties>) {
    return loadConfig(props, (key, value) => {
        switch (key) {
            case "columnWidths": {
                return [["widths", loadColumnsWidth(value as (typeof DEFAULTS)["columnWidths"])]];
            }
            case "columnHeadersPosition": {
                const val = value as (typeof DEFAULTS)["columnHeadersPosition"];
                return [["column_header", getValueOrDefault(val, DEFAULTS.columnHeadersPosition)]];
            }
            case "measureGroupDimension": {
                const val = value as (typeof DEFAULTS)["measureGroupDimension"];
                return [["metrics_in", getValueOrDefault(val, DEFAULTS.measureGroupDimension)]];
            }
            case "disableDrillDown":
                return [
                    [
                        "disable_drill_down",
                        getValueOrDefault(value as boolean, DEFAULTS.disableDrillDown, "bool"),
                    ],
                ];
            case "disableDrillIntoURL":
                return [
                    [
                        "disable_drill_into_url",
                        getValueOrDefault(value as boolean, DEFAULTS.disableDrillIntoURL, "bool"),
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
            case "textWrapping": {
                const val = value as (typeof DEFAULTS)["textWrapping"];
                return [["text_wrapping", loadTextWrapping(val)]];
            }
            case "pagination": {
                const val = value as (typeof DEFAULTS)["pagination"];
                return [["pagination", getValueOrDefault(val.enabled, DEFAULTS.pagination.enabled, "bool")]];
            }
            case "pageSize":
                return [["page_size", getValueOrDefault(value as number, DEFAULTS.pageSize, "number")]];
            case "enableAccessibility":
                return [
                    [
                        "enable_accessibility",
                        getValueOrDefault(value as boolean, DEFAULTS.enableAccessibility, "bool"),
                    ],
                ];
            case "grandTotalsPosition": {
                const val = value as (typeof DEFAULTS)["grandTotalsPosition"];
                return [["grand_totals_position", getValueOrDefault(val, DEFAULTS.grandTotalsPosition)]];
            }
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
        columnHeadersPosition: getValueOrDefault(config.column_header, DEFAULTS.columnHeadersPosition),
        measureGroupDimension: getValueOrDefault(config.metrics_in, DEFAULTS.measureGroupDimension),
        disableDrillDown: getValueOrDefault(config.disable_drill_down, DEFAULTS.disableDrillDown, "bool"),
        disableDrillIntoURL: getValueOrDefault(
            config.disable_drill_into_url,
            DEFAULTS.disableDrillIntoURL,
            "bool",
        ),
        disableAlerts: getValueOrDefault(config.disable_alerts, DEFAULTS.disableAlerts, "bool"),
        disableScheduledExports: getValueOrDefault(
            config.disable_scheduled_exports,
            DEFAULTS.disableScheduledExports,
            "bool",
        ),
        textWrapping: saveTextWrapping(config.text_wrapping as YamlTextWrapping | undefined),
        enableAccessibility: getValueOrDefault(
            config.enable_accessibility,
            DEFAULTS.enableAccessibility,
            "bool",
        ),
        pagination: savePagination(config.pagination),
        pageSize: getValueOrDefault(config.page_size, DEFAULTS.pageSize, "number"),
        grandTotalsPosition: getValueOrDefault(config.grand_totals_position, DEFAULTS.grandTotalsPosition),
    });
}

export const table = {
    load,
    save,
    DEFAULTS,
};
