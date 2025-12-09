// (C) 2025 GoodData Corporation

import { type IFormatPreset } from "../typings.js";

/**
 * Base currency preset definitions without localized names.
 * @internal
 */
export interface ICurrencyPresetDefinition {
    localIdentifier: string;
    format: string;
    previewNumber: number;
    messageId: string;
}

/**
 * Base currency preset definitions.
 * These are the raw preset data that can be used to create localized presets.
 * @internal
 */
export const CURRENCY_PRESET_DEFINITIONS: readonly ICurrencyPresetDefinition[] = [
    {
        localIdentifier: "currency",
        format: "$#,##0.00",
        previewNumber: 1000.12,
        messageId: "metricComponent.numberFormat.preset.currency",
    },
    {
        localIdentifier: "currency-single-decimal",
        format: "$#,##0.0",
        previewNumber: 1000.12,
        messageId: "metricComponent.numberFormat.preset.currency1",
    },
    {
        localIdentifier: "currency-rounded",
        format: "$#,##0",
        previewNumber: 1000.12,
        messageId: "metricComponent.numberFormat.preset.currencyRounded",
    },
] as const;

/**
 * Default message ID prefix for currency preset definitions.
 * @internal
 */
export const DEFAULT_CURRENCY_PRESET_PREFIX = "metricComponent.numberFormat.preset";

/**
 * Creates localized currency format presets.
 *
 * @param formatMessage - Function to format localized messages (e.g., from react-intl)
 * @param messageIdPrefix - Optional prefix for message IDs (default: "metricComponent.numberFormat.preset")
 * @returns Array of currency format presets with localized names
 * @internal
 */
export function createCurrencyPresets(
    formatMessage: (descriptor: { id: string }) => string,
    messageIdPrefix: string = DEFAULT_CURRENCY_PRESET_PREFIX,
): IFormatPreset[] {
    return CURRENCY_PRESET_DEFINITIONS.map((definition) => {
        // Extract the key part from the default message ID (e.g., "currency" from "metricComponent.numberFormat.preset.currency")
        const keyPart = definition.messageId.replace(`${DEFAULT_CURRENCY_PRESET_PREFIX}.`, "");
        const messageId = `${messageIdPrefix}.${keyPart}`;
        return {
            name: formatMessage({ id: messageId }),
            localIdentifier: definition.localIdentifier,
            format: definition.format,
            previewNumber: definition.previewNumber,
        };
    });
}
