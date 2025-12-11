// (C) 2025 GoodData Corporation

import { defineMessages } from "react-intl";

import { type IFormatPreset } from "../typings.js";

/**
 * Base standard preset definition without localized name.
 * @internal
 */
export interface IStandardPresetDefinition {
    localIdentifier: string;
    format: string;
    previewNumber: number;
    messageId: string;
}

/**
 * Message ids for standard numeric presets
 * @internal
 */
const standardPresetMessages = defineMessages({
    rounded: { id: "measureNumberFormat.numberFormat.preset.rounded" },
    decimal1: { id: "measureNumberFormat.numberFormat.preset.decimal1" },
    decimal2: { id: "measureNumberFormat.numberFormat.preset.decimal2" },
    percentRounded: { id: "measureNumberFormat.numberFormat.preset.percentRounded" },
    percent1: { id: "measureNumberFormat.numberFormat.preset.percent1" },
    percent2: { id: "measureNumberFormat.numberFormat.preset.percent2" },
});

/**
 * Standard numeric preset definitions.
 * These are the raw preset data that can be used to create localized presets.
 * @internal
 */
export const STANDARD_PRESET_DEFINITIONS: readonly IStandardPresetDefinition[] = [
    {
        localIdentifier: "rounded",
        format: "#,##0",
        previewNumber: 1000.12,
        messageId: standardPresetMessages.rounded.id,
    },
    {
        localIdentifier: "decimal-1",
        format: "#,##0.0",
        previewNumber: 1000.12,
        messageId: standardPresetMessages.decimal1.id,
    },
    {
        localIdentifier: "decimal-2",
        format: "#,##0.00",
        previewNumber: 1000.12,
        messageId: standardPresetMessages.decimal2.id,
    },
    {
        localIdentifier: "percent-rounded",
        format: "#,##0%",
        previewNumber: 0.1,
        messageId: standardPresetMessages.percentRounded.id,
    },
    {
        localIdentifier: "percent-1",
        format: "#,##0.0%",
        previewNumber: 0.101,
        messageId: standardPresetMessages.percent1.id,
    },
    {
        localIdentifier: "percent-2",
        format: "#,##0.00%",
        previewNumber: 0.1012,
        messageId: standardPresetMessages.percent2.id,
    },
] as const;

/**
 * Creates localized standard format presets.
 *
 * @param formatMessage - Function to format localized messages (e.g., from react-intl)
 * @returns Array of standard format presets with localized names
 * @internal
 */
export function createStandardPresets(
    formatMessage: (descriptor: { id: string }) => string,
): IFormatPreset[] {
    return STANDARD_PRESET_DEFINITIONS.map((definition) => {
        return {
            name: formatMessage({ id: definition.messageId }),
            localIdentifier: definition.localIdentifier,
            format: definition.format,
            previewNumber: definition.previewNumber,
        };
    });
}
