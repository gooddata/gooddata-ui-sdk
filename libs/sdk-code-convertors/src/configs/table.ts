// (C) 2023-2026 GoodData Corporation

import type { Visualisation } from "@gooddata/sdk-code-schemas/v1";

import { loadColumnsWidth, loadDisableKda, saveColumnWidths } from "../utils/configUtils.js";

import { type ColumnLocator, type ColumnWidthItem } from "./types.js";
import {
    type ConfigDefaults,
    type VisualisationConfig,
    getValueOrDefault,
    loadConfig,
    saveConfigObject,
} from "./utils.js";

/** @internal */
export type TableConfigProperties = {
    columnWidths: Array<ColumnWidthItem>;
    measureGroupDimension: "columns" | "rows";
    columnHeadersPosition: "top" | "left";
    disableDrillDown: boolean;
    disableDrillIntoURL: boolean;
    disableAlerts: boolean;
    disableScheduledExports: boolean;
    disableKeyDriveAnalysisOn: Record<string, boolean>;
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
    conditionalFormatting: {
        version?: string;
        enabled: boolean;
        rules: Array<{
            id: string;
            target:
                | { kind: "measure"; measureIdentifier: string }
                | { kind: "attribute"; attributeIdentifier: string };
            conditions: Array<{
                id: string;
                operator: string;
                value:
                    | { kind: "none" }
                    | { kind: "literal"; value: string | number }
                    | { kind: "literalRange"; from: number; to: number };
                format: { color?: string; backgroundColor?: string; scope: "cell" | "row" };
            }>;
        }>;
    };
};

/** @internal */
const DEFAULTS: ConfigDefaults<TableConfigProperties> = {
    columnWidths: [],
    measureGroupDimension: "columns",
    columnHeadersPosition: "top",
    disableAlerts: false,
    disableDrillDown: false,
    disableDrillIntoURL: true,
    disableScheduledExports: false,
    disableKeyDriveAnalysisOn: {},
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
    conditionalFormatting: { enabled: false, rules: [] },
};

type TextWrapping = TableConfigProperties["textWrapping"];
type TextWrappingOverride = TextWrapping["columnOverrides"][number];

type ConditionalFormatting = TableConfigProperties["conditionalFormatting"];
type ConditionalFormattingRule = ConditionalFormatting["rules"][number];
type ConditionalFormattingCondition = ConditionalFormattingRule["conditions"][number];
type ConditionalFormattingValue = ConditionalFormattingCondition["value"];

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

type YamlConditionalFormatting = {
    version?: string;
    enabled?: boolean;
    rules?: Array<{
        id: string;
        target: { measure?: string; attribute?: string };
        conditions: Array<{
            id: string;
            operator: string;
            value?: number | string | { from: number; to: number } | null;
            format: { text?: string; fill?: string; scope: "cell" | "row" };
        }>;
    }>;
};

// internal -> YAML (condensed authoring form)

function loadConditionalFormattingValue(value: ConditionalFormattingValue): object {
    if (value.kind === "literal") {
        return { value: value.value };
    }
    if (value.kind === "literalRange") {
        return { value: { from: value.from, to: value.to } };
    }
    return {};
}

function loadConditionalFormattingCondition(condition: ConditionalFormattingCondition): object {
    return {
        id: condition.id,
        operator: condition.operator.toLowerCase(),
        ...loadConditionalFormattingValue(condition.value),
        format: {
            ...(condition.format.color ? { text: condition.format.color } : {}),
            ...(condition.format.backgroundColor ? { fill: condition.format.backgroundColor } : {}),
            scope: condition.format.scope,
        },
    };
}

function loadConditionalFormattingRule(rule: ConditionalFormattingRule): object {
    return {
        id: rule.id,
        target:
            rule.target.kind === "measure"
                ? { measure: rule.target.measureIdentifier }
                : { attribute: rule.target.attributeIdentifier },
        conditions: rule.conditions.map(loadConditionalFormattingCondition),
    };
}

function loadConditionalFormatting(value: ConditionalFormatting | undefined): object | undefined {
    if (!value || (value.rules.length === 0 && !value.enabled)) {
        return undefined;
    }
    return {
        ...(value.version ? { version: value.version } : {}),
        enabled: value.enabled,
        rules: value.rules.map(loadConditionalFormattingRule),
    };
}

// YAML -> internal

function saveConditionalFormattingValue(
    value: number | string | { from: number; to: number } | null | undefined,
): ConditionalFormattingValue {
    if (value === null || value === undefined) {
        return { kind: "none" };
    }
    // Only a {from,to} object is a range; guard "from" so a stray object can't crash the conversion.
    if (typeof value === "object" && "from" in value) {
        return { kind: "literalRange", from: value.from, to: value.to };
    }
    return { kind: "literal", value };
}

function saveConditionalFormattingRule(
    rule: NonNullable<YamlConditionalFormatting["rules"]>[number],
): ConditionalFormattingRule {
    return {
        id: rule.id,
        target:
            rule.target.measure === undefined
                ? { kind: "attribute", attributeIdentifier: rule.target.attribute ?? "" }
                : { kind: "measure", measureIdentifier: rule.target.measure },
        conditions: rule.conditions.map((condition) => ({
            id: condition.id,
            operator: condition.operator.toUpperCase(),
            value: saveConditionalFormattingValue(condition.value),
            format: {
                ...(condition.format.text ? { color: condition.format.text } : {}),
                ...(condition.format.fill ? { backgroundColor: condition.format.fill } : {}),
                scope: condition.format.scope,
            },
        })),
    };
}

function saveConditionalFormatting(
    value: YamlConditionalFormatting | undefined,
): ConditionalFormatting | undefined {
    const rules = value?.rules ?? [];
    // Same drop condition as loadConditionalFormatting: drop only the fully-empty default so the
    // config round-trips symmetrically (an enabled-but-ruleless config is preserved on both sides).
    if (!value || (rules.length === 0 && !value.enabled)) {
        return undefined;
    }
    return {
        ...(value.version ? { version: value.version } : {}),
        enabled: value.enabled ?? false,
        rules: rules.map(saveConditionalFormattingRule),
    };
}

/** @internal */
export const TABLE_DEFAULTS = DEFAULTS;

/** @internal */
export function tableLoad(props: VisualisationConfig<TableConfigProperties>) {
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
            case "disableKeyDriveAnalysisOn":
                return [["disable_key_drive_analysis", loadDisableKda(value as Record<string, boolean>)]];
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
            case "conditionalFormatting": {
                const val = value as (typeof DEFAULTS)["conditionalFormatting"];
                return [["conditional_formatting", loadConditionalFormatting(val)]];
            }
            default:
                return [];
        }
    });
}

/** @internal */
export function tableSave(
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
        disableKeyDriveAnalysisOn: saveConfigObject(config.disable_key_drive_analysis),
        textWrapping: saveTextWrapping(config.text_wrapping as YamlTextWrapping | undefined),
        enableAccessibility: getValueOrDefault(
            config.enable_accessibility,
            DEFAULTS.enableAccessibility,
            "bool",
        ),
        pagination: savePagination(config.pagination),
        pageSize: getValueOrDefault(config.page_size, DEFAULTS.pageSize, "number"),
        grandTotalsPosition: getValueOrDefault(config.grand_totals_position, DEFAULTS.grandTotalsPosition),
        conditionalFormatting: saveConditionalFormatting(
            config.conditional_formatting as YamlConditionalFormatting | undefined,
        ),
    });
}

/**
 * @internal
 * @deprecated Use tableLoad and tableSave instead.
 */
export interface ITableConfig {
    load: typeof tableLoad;
    save: typeof tableSave;
    DEFAULTS: ConfigDefaults<TableConfigProperties>;
}

/**
 * @internal
 * @deprecated Use tableLoad and tableSave instead.
 */
export const table: ITableConfig = {
    load: tableLoad,
    save: tableSave,
    DEFAULTS,
};
