// (C) 2023-2025 GoodData Corporation
import { type IntlShape } from "react-intl";

import {
    type CalculationType,
    type ICalculationDefaultValue,
    type IColorConfig,
    getCalculationValuesDefault,
    getComparisonFormat,
} from "@gooddata/sdk-ui-charts";
import { type IFormatPreset, type IFormatTemplate } from "@gooddata/sdk-ui-kit";

import { comparisonMessages } from "../../locales.js";
import {
    type HeadlineControlProperties,
    type IComparisonControlProperties,
} from "../interfaces/ControlProperties.js";
import { type IVisualizationProperties } from "../interfaces/Visualization.js";

const NUMBER_FORMAT_PRESET_INHERIT = "inherit";

export function getComparisonDefaultValues(
    defaultCalculationType: CalculationType,
    properties: IVisualizationProperties<HeadlineControlProperties>,
): ICalculationDefaultValue {
    const calculationType = properties?.controls?.comparison?.calculationType || defaultCalculationType;
    return getCalculationValuesDefault(calculationType);
}

export function getNumberFormat(
    properties: IVisualizationProperties<IComparisonControlProperties>,
    defaultFormat: string,
) {
    return getComparisonFormat(properties?.controls?.comparison?.format, defaultFormat);
}

export function getNumberSubFormat(properties: IVisualizationProperties<IComparisonControlProperties>) {
    return getComparisonFormat(properties?.controls?.comparison?.subFormat, null);
}

export function isComparisonDefaultColors(colorConfig: IColorConfig) {
    return !colorConfig?.positive && !colorConfig?.negative && !colorConfig?.equals;
}

export const getPresets = (intl: IntlShape): ReadonlyArray<IFormatPreset> => [
    {
        name: intl.formatMessage(comparisonMessages["formatPresetInherit"]),
        localIdentifier: NUMBER_FORMAT_PRESET_INHERIT,
        format: null,
        previewNumber: 1000.12,
    },
    {
        name: intl.formatMessage(comparisonMessages["formatPresetRounded"]),
        localIdentifier: "rounded",
        format: "#,##0",
        previewNumber: 1000.12,
    },
    {
        name: intl.formatMessage(comparisonMessages["formatPresetDecimal1"]),
        localIdentifier: "decimal-1",
        format: "#,##0.0",
        previewNumber: 1000.12,
    },
    {
        name: intl.formatMessage(comparisonMessages["formatPresetDecimal2"]),
        localIdentifier: "decimal-2",
        format: "#,##0.00",
        previewNumber: 1000.12,
    },
    {
        name: intl.formatMessage(comparisonMessages["formatPresetPercentRounded"]),
        localIdentifier: "percent-rounded",
        format: "#,##0%",
        previewNumber: 0.1,
    },
    {
        name: intl.formatMessage(comparisonMessages["formatPresetPercent1"]),
        localIdentifier: "percent-1",
        format: "#,##0.0%",
        previewNumber: 0.101,
    },
    {
        name: intl.formatMessage(comparisonMessages["formatPresetPercent2"]),
        localIdentifier: "percent-2",
        format: "#,##0.00%",
        previewNumber: 0.1012,
    },
];

/**
 * @internal
 */
export const getTemplates = (intl: IntlShape): ReadonlyArray<IFormatTemplate> => [
    {
        name: intl.formatMessage(comparisonMessages["formatTemplateRounded"]),
        localIdentifier: "rounded",
        format: "#,##0",
    },
    {
        name: intl.formatMessage(comparisonMessages["formatTemplateDecimal1"]),
        localIdentifier: "decimal-1",
        format: "#,##0.0",
    },
    {
        name: intl.formatMessage(comparisonMessages["formatTemplateDecimal2"]),
        localIdentifier: "decimal-2",
        format: "#,##0.00",
    },
    {
        name: intl.formatMessage(comparisonMessages["formatTemplatePercentRounded"]),
        localIdentifier: "percent-rounded",
        format: "#,##0%",
    },
    {
        name: intl.formatMessage(comparisonMessages["formatTemplatePercent1"]),
        localIdentifier: "percent-1",
        format: "#,##0.0%",
    },
    {
        name: intl.formatMessage(comparisonMessages["formatTemplatePercent2"]),
        localIdentifier: "percent-2",
        format: "#,##0.00%",
    },
    {
        name: intl.formatMessage(comparisonMessages["formatTemplateCurrency"]),
        localIdentifier: "currency",
        format: "$#,##0.00",
    },
    {
        name: intl.formatMessage(comparisonMessages["formatTemplateCurrencyShortened"]),
        localIdentifier: "currency-shortened",
        format:
            "[>=1000000000000]$#,,,,.0 T;\n" +
            "[>=1000000000]$#,,,.0 B;\n" +
            "[>=1000000]$#,,.0 M;\n" +
            "[>=1000]$#,.0 K;\n" +
            "[>=0]$#,##0;\n" +
            "[<=-1000000000000]-$#,,,,.0 T;\n" +
            "[<=-1000000000]-$#,,,.0 B;\n" +
            "[<=-1000000]-$#,,.0 M;\n" +
            "[<=-1000]-$#,.0 K;\n" +
            "[<0]-$#,##0",
    },
    {
        name: intl.formatMessage(comparisonMessages["formatTemplateLargeNumbersShortened"]),
        localIdentifier: "large-numbers-shortened",
        format:
            "[>=1000000000000]#,,,,.0 T;\n" +
            "[>=1000000000]#,,,.0 B;\n" +
            "[>=1000000]#,,.0 M;\n" +
            "[>=1000]#,.0 K;\n" +
            "[>=0]#,##0;\n" +
            "[<=-1000000000000]-#,,,,.0 T;\n" +
            "[<=-1000000000]-#,,,.0 B;\n" +
            "[<=-1000000]-#,,.0 M;\n" +
            "[<=-1000]-#,.0 K;\n" +
            "[<0]-#,##0",
    },
    {
        name: intl.formatMessage(comparisonMessages["formatTemplateLargeNumbersShortenedWithColors"]),
        localIdentifier: "large-numbers-shortened-with-colors",
        format:
            "[>=1000000000000][green]#,,,,.0 T;\n" +
            "[>=1000000000][green]#,,,.0 B;\n" +
            "[>=1000000][green]#,,.0 M;\n" +
            "[>=1000][black]#,.0 K;\n" +
            "[>=0][black]#,##0;\n" +
            "[<=-1000000000000][red]-#,,,,.0 T;\n" +
            "[<=-1000000000][red]-#,,,.0 B;\n" +
            "[<=-1000000][red]-#,,.0 M;\n" +
            "[<=-1000][red]-#,.0 K;\n" +
            "[<0][black]-#,##0",
    },
    {
        name: intl.formatMessage(comparisonMessages["formatTemplateNegativeNumbersRed"]),
        localIdentifier: "negative-numbers-red",
        format: "[<0][red]-#,##0.0;\n" + "[black]#,##0.0",
    },
    {
        name: intl.formatMessage(comparisonMessages["formatTemplateFinancial"]),
        localIdentifier: "financial",
        format: "[<0](#,##0.0);\n" + "#,##0.0",
    },
    {
        name: intl.formatMessage(comparisonMessages["formatTemplateDecimalWithoutThousandsSeparator"]),
        localIdentifier: "decimal-without-thousands-separator",
        format: "0.00",
    },
    {
        name: intl.formatMessage(comparisonMessages["formatTemplateConditionalColors"]),
        localIdentifier: "conditional-colors",
        format: "[<0][red]#,#.##;\n" + "[<1000][black]#,0.##;\n" + "[>=1000][green]#,#.##",
    },
    {
        name: intl.formatMessage(comparisonMessages["formatTemplateTrendSymbols"]),
        localIdentifier: "trend-symbols",
        format: "[<0][green]▲ #,##0.0%;\n" + "[=0][black]#,##0.0%;\n" + "[>0][red]▼ #,##0.0%",
    },
    {
        name: intl.formatMessage(comparisonMessages["formatTemplateTimeFromSeconds"]),
        localIdentifier: "time-from-seconds",
        format:
            "[>=86400]{{{86400||0d}}} {{{3600|24|00}}}h;\n" +
            "[>=3600]{{{3600|24|00}}}h {{{60|60|00}}}m;\n" +
            "[>=60]{{{60|60|00}}}m {{{|60.|00}}}s;\n" +
            "[>0]{{{|60.|00.0}}}s;\n" +
            "[=0]{{{|60.|0}}}",
    },
    {
        name: intl.formatMessage(comparisonMessages["formatTemplateZeroInsteadOfNull"]),
        localIdentifier: "zero-instead-of-null",
        format: "[=null]0.00;\n" + "[>=0]#,#0.00;\n" + "[<0]-#,#0.00",
    },
];
