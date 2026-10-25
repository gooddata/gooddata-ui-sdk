// (C) 2025-2026 GoodData Corporation

import { type IFormatPreset } from "@gooddata/sdk-ui-kit";

/**
 * Determines the effective selected format based on priority:
 * 1. If user explicitly set a format in bucket (selectedFormat !== null), use it
 * 2. Otherwise, if metric has a custom format (defaultCustomFormat), use it
 * 3. Otherwise, if inherit preset is available, use its format
 * 4. Otherwise, use null (will show "Custom" in dropdown)
 *
 * @param selectedFormat - Format explicitly set by user in bucket item
 * @param defaultCustomFormat - Format from the catalog item (metric's own format)
 * @param inheritPreset - The inherit preset if available
 * @returns The effective format to display as selected
 */
export function getEffectiveSelectedFormat(
    selectedFormat: string | null,
    defaultCustomFormat: string | null,
    inheritPreset: IFormatPreset | null,
): string | null {
    if (selectedFormat !== null) {
        return selectedFormat;
    }
    if (defaultCustomFormat) {
        return defaultCustomFormat;
    }
    if (inheritPreset) {
        return inheritPreset.format;
    }
    return null;
}
