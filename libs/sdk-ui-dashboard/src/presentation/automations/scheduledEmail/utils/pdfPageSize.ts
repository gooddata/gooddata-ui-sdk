// (C) 2026 GoodData Corporation

import { type IExportDefinitionVisualizationObjectSettings } from "@gooddata/sdk-model";

export type PdfPageSize = NonNullable<IExportDefinitionVisualizationObjectSettings["pageSize"]>;

/**
 * Returns the default PDF page size based on the format locale.
 *
 * @param formatLocale - The format locale to use.
 * @returns The default PDF page size.
 */
export function getDefaultPdfPageSize(formatLocale?: string): PdfPageSize {
    if (!formatLocale) {
        return "A4";
    }

    // Intl.Locale parses the region subtag correctly regardless of script/variant subtags
    // (e.g. "sr-Latn-US", "en_US_POSIX"), unlike a positional split on "-".
    try {
        const region = new Intl.Locale(formatLocale.replace(/_/g, "-")).region?.toUpperCase();
        return region === "US" || region === "CA" ? "LETTER" : "A4";
    } catch {
        return "A4";
    }
}
