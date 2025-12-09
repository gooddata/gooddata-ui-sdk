// (C) 2025 GoodData Corporation

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
 * Standard numeric preset definitions.
 * These are the raw preset data that can be used to create localized presets.
 * @internal
 */
export const STANDARD_PRESET_DEFINITIONS: readonly IStandardPresetDefinition[] = [
    {
        localIdentifier: "rounded",
        format: "#,##0",
        previewNumber: 1000.12,
        messageId: "metricComponent.numberFormat.preset.rounded",
    },
    {
        localIdentifier: "decimal-1",
        format: "#,##0.0",
        previewNumber: 1000.12,
        messageId: "metricComponent.numberFormat.preset.decimal1",
    },
    {
        localIdentifier: "decimal-2",
        format: "#,##0.00",
        previewNumber: 1000.12,
        messageId: "metricComponent.numberFormat.preset.decimal2",
    },
    {
        localIdentifier: "percent-rounded",
        format: "#,##0%",
        previewNumber: 0.1,
        messageId: "metricComponent.numberFormat.preset.percentRounded",
    },
    {
        localIdentifier: "percent-1",
        format: "#,##0.0%",
        previewNumber: 0.101,
        messageId: "metricComponent.numberFormat.preset.percent1",
    },
    {
        localIdentifier: "percent-2",
        format: "#,##0.00%",
        previewNumber: 0.1012,
        messageId: "metricComponent.numberFormat.preset.percent2",
    },
] as const;

/**
 * Default message ID prefix for standard preset definitions.
 * @internal
 */
export const DEFAULT_STANDARD_PRESET_PREFIX = "metricComponent.numberFormat.preset";

/**
 * Creates localized standard format presets.
 *
 * @param formatMessage - Function to format localized messages (e.g., from react-intl)
 * @param messageIdPrefix - Optional prefix for message IDs (default: "metricComponent.numberFormat.preset")
 * @returns Array of standard format presets with localized names
 * @internal
 */
export function createStandardPresets(
    formatMessage: (descriptor: { id: string }) => string,
    messageIdPrefix: string = DEFAULT_STANDARD_PRESET_PREFIX,
): IFormatPreset[] {
    return STANDARD_PRESET_DEFINITIONS.map((definition) => {
        // Extract the key part from the default message ID (e.g., "rounded" from "metricComponent.numberFormat.preset.rounded")
        const keyPart = definition.messageId.replace(`${DEFAULT_STANDARD_PRESET_PREFIX}.`, "");
        const messageId = `${messageIdPrefix}.${keyPart}`;
        return {
            name: formatMessage({ id: messageId }),
            localIdentifier: definition.localIdentifier,
            format: definition.format,
            previewNumber: definition.previewNumber,
        };
    });
}
