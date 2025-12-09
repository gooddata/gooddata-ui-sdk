// (C) 2025 GoodData Corporation

import { type IFormatTemplate } from "../typings.js";

/**
 * Base template definition without localized name.
 * @internal
 */
export interface ITemplateDefinition {
    localIdentifier: string;
    format: string;
    messageId: string;
}

/**
 * Standard format template definitions (basic numeric formats).
 * @internal
 */
export const STANDARD_TEMPLATE_DEFINITIONS: readonly ITemplateDefinition[] = [
    {
        localIdentifier: "rounded",
        format: "#,##0",
        messageId: "metricComponent.numberFormat.template.rounded",
    },
    {
        localIdentifier: "decimal-1",
        format: "#,##0.0",
        messageId: "metricComponent.numberFormat.template.decimal1",
    },
    {
        localIdentifier: "decimal-2",
        format: "#,##0.00",
        messageId: "metricComponent.numberFormat.template.decimal2",
    },
    {
        localIdentifier: "percent-rounded",
        format: "#,##0%",
        messageId: "metricComponent.numberFormat.template.percentRounded",
    },
    {
        localIdentifier: "percent-1",
        format: "#,##0.0%",
        messageId: "metricComponent.numberFormat.template.percent1",
    },
    {
        localIdentifier: "percent-2",
        format: "#,##0.00%",
        messageId: "metricComponent.numberFormat.template.percent2",
    },
] as const;

/**
 * Currency format template definitions.
 * @internal
 */
export const CURRENCY_TEMPLATE_DEFINITIONS: readonly ITemplateDefinition[] = [
    {
        localIdentifier: "currency",
        format: "$#,##0.00",
        messageId: "metricComponent.numberFormat.template.currency",
    },
    {
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
        messageId: "metricComponent.numberFormat.template.currencyShortened",
    },
] as const;

/**
 * Advanced format template definitions (complex conditional formats).
 * @internal
 */
export const ADVANCED_TEMPLATE_DEFINITIONS: readonly ITemplateDefinition[] = [
    {
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
        messageId: "metricComponent.numberFormat.template.largeNumbersShortened",
    },
    {
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
        messageId: "metricComponent.numberFormat.template.largeNumbersShortenedWithColors",
    },
    {
        localIdentifier: "negative-numbers-red",
        format: "[<0][red]-#,##0.0;\n[black]#,##0.0",
        messageId: "metricComponent.numberFormat.template.negativeNumbersRed",
    },
    {
        localIdentifier: "financial",
        format: "[<0](#,##0.0);\n#,##0.0",
        messageId: "metricComponent.numberFormat.template.financial",
    },
    {
        localIdentifier: "decimal-without-thousands-separator",
        format: "0.00",
        messageId: "metricComponent.numberFormat.template.decimalWithoutThousandsSeparator",
    },
    {
        localIdentifier: "conditional-colors",
        format: "[<0][red]#,#.##;\n[<1000][black]#,0.##;\n[>=1000][green]#,#.##",
        messageId: "metricComponent.numberFormat.template.conditionalColors",
    },
    {
        localIdentifier: "trend-symbols",
        format: "[<0][green]▲ #,##0.0%;\n[=0][black]#,##0.0%;\n[>0][red]▼ #,##0.0%",
        messageId: "metricComponent.numberFormat.template.trendSymbols",
    },
    {
        localIdentifier: "time-from-seconds",
        format:
            "[>=86400]{{{86400||0d}}} {{{3600|24|00}}}h;\n" +
            "[>=3600]{{{3600|24|00}}}h {{{60|60|00}}}m;\n" +
            "[>=60]{{{60|60|00}}}m {{{|60.|00}}}s;\n" +
            "[>0]{{{|60.|00.0}}}s;\n" +
            "[=0]{{{|60.|0}}}",
        messageId: "metricComponent.numberFormat.template.timeFromSeconds",
    },
    {
        localIdentifier: "zero-instead-of-null",
        format: "[=null]0.00;\n[>=0]#,#0.00;\n[<0]-#,#0.00",
        messageId: "metricComponent.numberFormat.template.zeroInsteadOfNull",
    },
] as const;

/**
 * Local identifiers of templates that are currency-specific.
 * Used to filter templates when metric type is CURRENCY.
 * @internal
 */
export const CURRENCY_TEMPLATE_IDS = CURRENCY_TEMPLATE_DEFINITIONS.map((t) => t.localIdentifier);

/**
 * Default message ID prefix for template definitions.
 * @internal
 */
export const DEFAULT_TEMPLATE_PREFIX = "metricComponent.numberFormat.template";

/**
 * Creates localized format templates.
 *
 * @param formatMessage - Function to format localized messages (e.g., from react-intl)
 * @param definitions - Template definitions to localize
 * @param messageIdPrefix - Optional prefix for message IDs (default: "metricComponent.numberFormat.template")
 * @returns Array of format templates with localized names
 * @internal
 */
export function createTemplates(
    formatMessage: (descriptor: { id: string }) => string,
    definitions: readonly ITemplateDefinition[],
    messageIdPrefix: string = DEFAULT_TEMPLATE_PREFIX,
): IFormatTemplate[] {
    return definitions.map((definition) => {
        // Extract the key part from the default message ID (e.g., "rounded" from "metricComponent.numberFormat.template.rounded")
        const keyPart = definition.messageId.replace(`${DEFAULT_TEMPLATE_PREFIX}.`, "");
        const messageId = `${messageIdPrefix}.${keyPart}`;
        return {
            name: formatMessage({ id: messageId }),
            localIdentifier: definition.localIdentifier,
            format: definition.format,
        };
    });
}

/**
 * Creates all localized format templates (standard + currency + advanced).
 *
 * @param formatMessage - Function to format localized messages (e.g., from react-intl)
 * @param messageIdPrefix - Optional prefix for message IDs (default: "metricComponent.numberFormat.template")
 * @returns Array of all format templates with localized names
 * @internal
 */
export function createAllTemplates(
    formatMessage: (descriptor: { id: string }) => string,
    messageIdPrefix: string = DEFAULT_TEMPLATE_PREFIX,
): IFormatTemplate[] {
    return [
        ...createTemplates(formatMessage, STANDARD_TEMPLATE_DEFINITIONS, messageIdPrefix),
        ...createTemplates(formatMessage, CURRENCY_TEMPLATE_DEFINITIONS, messageIdPrefix),
        ...createTemplates(formatMessage, ADVANCED_TEMPLATE_DEFINITIONS, messageIdPrefix),
    ];
}
