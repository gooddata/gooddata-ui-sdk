// (C) 2025 GoodData Corporation

import { defineMessages } from "react-intl";

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
 * Message IDs for standard template definitions.
 * @internal
 */
const standardTemplateMessages = defineMessages({
    rounded: { id: "measureNumberFormat.numberFormat.template.rounded" },
    decimal1: { id: "measureNumberFormat.numberFormat.template.decimal1" },
    decimal2: { id: "measureNumberFormat.numberFormat.template.decimal2" },
    percentRounded: { id: "measureNumberFormat.numberFormat.template.percentRounded" },
    percent1: { id: "measureNumberFormat.numberFormat.template.percent1" },
    percent2: { id: "measureNumberFormat.numberFormat.template.percent2" },
});

/**
 * Standard format template definitions (basic numeric formats).
 * @internal
 */
export const STANDARD_TEMPLATE_DEFINITIONS: readonly ITemplateDefinition[] = [
    {
        localIdentifier: "rounded",
        format: "#,##0",
        messageId: standardTemplateMessages.rounded.id,
    },
    {
        localIdentifier: "decimal-1",
        format: "#,##0.0",
        messageId: standardTemplateMessages.decimal1.id,
    },
    {
        localIdentifier: "decimal-2",
        format: "#,##0.00",
        messageId: standardTemplateMessages.decimal2.id,
    },
    {
        localIdentifier: "percent-rounded",
        format: "#,##0%",
        messageId: standardTemplateMessages.percentRounded.id,
    },
    {
        localIdentifier: "percent-1",
        format: "#,##0.0%",
        messageId: standardTemplateMessages.percent1.id,
    },
    {
        localIdentifier: "percent-2",
        format: "#,##0.00%",
        messageId: standardTemplateMessages.percent2.id,
    },
] as const;

/**
 * Currency template definitions are now empty - currency formats have been moved to presets.
 * This array is kept for backward compatibility but should not be used.
 * @internal
 * @deprecated Currency formats are now in CURRENCY_PRESET_DEFINITIONS
 */
export const CURRENCY_TEMPLATE_DEFINITIONS: readonly ITemplateDefinition[] = [] as const;

/**
 * Message IDs for advanced template definitions.
 * @internal
 */
const advancedTemplateMessages = defineMessages({
    largeNumbersShortened: { id: "measureNumberFormat.numberFormat.template.largeNumbersShortened" },
    largeNumbersShortenedWithColors: {
        id: "measureNumberFormat.numberFormat.template.largeNumbersShortenedWithColors",
    },
    negativeNumbersRed: { id: "measureNumberFormat.numberFormat.template.negativeNumbersRed" },
    financial: { id: "measureNumberFormat.numberFormat.template.financial" },
    decimalWithoutThousandsSeparator: {
        id: "measureNumberFormat.numberFormat.template.decimalWithoutThousandsSeparator",
    },
    conditionalColors: { id: "measureNumberFormat.numberFormat.template.conditionalColors" },
    trendSymbols: { id: "measureNumberFormat.numberFormat.template.trendSymbols" },
    timeFromSeconds: { id: "measureNumberFormat.numberFormat.template.timeFromSeconds" },
    zeroInsteadOfNull: { id: "measureNumberFormat.numberFormat.template.zeroInsteadOfNull" },
});

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
        messageId: advancedTemplateMessages.largeNumbersShortened.id,
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
        messageId: advancedTemplateMessages.largeNumbersShortenedWithColors.id,
    },
    {
        localIdentifier: "negative-numbers-red",
        format: "[<0][red]-#,##0.0;\n[black]#,##0.0",
        messageId: advancedTemplateMessages.negativeNumbersRed.id,
    },
    {
        localIdentifier: "financial",
        format: "[<0](#,##0.0);\n#,##0.0",
        messageId: advancedTemplateMessages.financial.id,
    },
    {
        localIdentifier: "decimal-without-thousands-separator",
        format: "0.00",
        messageId: advancedTemplateMessages.decimalWithoutThousandsSeparator.id,
    },
    {
        localIdentifier: "conditional-colors",
        format: "[<0][red]#,#.##;\n[<1000][black]#,0.##;\n[>=1000][green]#,#.##",
        messageId: advancedTemplateMessages.conditionalColors.id,
    },
    {
        localIdentifier: "trend-symbols",
        format: "[<0][green]▲ #,##0.0%;\n[=0][black]#,##0.0%;\n[>0][red]▼ #,##0.0%",
        messageId: advancedTemplateMessages.trendSymbols.id,
    },
    {
        localIdentifier: "time-from-seconds",
        format:
            "[>=86400]{{{86400||0d}}} {{{3600|24|00}}}h;\n" +
            "[>=3600]{{{3600|24|00}}}h {{{60|60|00}}}m;\n" +
            "[>=60]{{{60|60|00}}}m {{{|60.|00}}}s;\n" +
            "[>0]{{{|60.|00.0}}}s;\n" +
            "[=0]{{{|60.|0}}}",
        messageId: advancedTemplateMessages.timeFromSeconds.id,
    },
    {
        localIdentifier: "zero-instead-of-null",
        format: "[=null]0.00;\n[>=0]#,#0.00;\n[<0]-#,#0.00",
        messageId: advancedTemplateMessages.zeroInsteadOfNull.id,
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
export const DEFAULT_TEMPLATE_PREFIX = "measureNumberFormat.numberFormat.template";

/**
 * Creates localized format templates.
 *
 * @param formatMessage - Function to format localized messages (e.g., from react-intl)
 * @param definitions - Template definitions to localize
 * @param messageIdPrefix - Optional prefix for message IDs (default: "measureNumberFormat.numberFormat.template")
 * @returns Array of format templates with localized names
 * @internal
 */
export function createTemplates(
    formatMessage: (descriptor: { id: string }) => string,
    definitions: readonly ITemplateDefinition[],
    messageIdPrefix: string = DEFAULT_TEMPLATE_PREFIX,
): IFormatTemplate[] {
    return definitions.map((definition) => {
        // Extract the key part from the default message ID (e.g., "rounded" from "measureNumberFormat.numberFormat.template.rounded")
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
 * Creates advanced format templates only.
 * These are templates that don't duplicate presets (complex conditional formats).
 *
 * @param formatMessage - Function to format localized messages (e.g., from react-intl)
 * @returns Array of advanced format templates with localized names
 * @internal
 */
export function createAdvancedTemplates(
    formatMessage: (descriptor: { id: string }) => string,
): IFormatTemplate[] {
    return createTemplates(formatMessage, ADVANCED_TEMPLATE_DEFINITIONS);
}

/**
 * Creates all localized format templates (standard + currency + advanced).
 *
 * @param formatMessage - Function to format localized messages (e.g., from react-intl)
 * @param messageIdPrefix - Optional prefix for message IDs (default: "measureNumberFormat.numberFormat.template")
 * @returns Array of all format templates with localized names
 * @internal
 * @deprecated Use createAdvancedTemplates instead - standard and currency templates duplicate presets
 */
export function createAllTemplates(formatMessage: (descriptor: { id: string }) => string): IFormatTemplate[] {
    return [
        ...createTemplates(formatMessage, STANDARD_TEMPLATE_DEFINITIONS),
        ...createTemplates(formatMessage, CURRENCY_TEMPLATE_DEFINITIONS),
        ...createTemplates(formatMessage, ADVANCED_TEMPLATE_DEFINITIONS),
    ];
}
