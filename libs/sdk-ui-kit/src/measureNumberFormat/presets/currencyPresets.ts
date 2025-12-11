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
        messageId: "measureNumberFormat.numberFormat.preset.currency",
    },
    {
        localIdentifier: "currency-single-decimal",
        format: "$#,##0.0",
        previewNumber: 1000.12,
        messageId: "measureNumberFormat.numberFormat.preset.currency1",
    },
    {
        localIdentifier: "currency-rounded",
        format: "$#,##0",
        previewNumber: 1000.12,
        messageId: "measureNumberFormat.numberFormat.preset.currencyRounded",
    },
] as const;

/**
 * Creates localized currency format presets.
 *
 * @param formatMessage - Function to format localized messages (e.g., from react-intl)
 * @returns Array of currency format presets with localized names
 * @internal
 */
export function createCurrencyPresets(
    formatMessage: (descriptor: { id: string }) => string,
): IFormatPreset[] {
    return CURRENCY_PRESET_DEFINITIONS.map((definition) => {
        return {
            name: formatMessage({ id: definition.messageId }),
            localIdentifier: definition.localIdentifier,
            format: definition.format,
            previewNumber: definition.previewNumber,
        };
    });
}
