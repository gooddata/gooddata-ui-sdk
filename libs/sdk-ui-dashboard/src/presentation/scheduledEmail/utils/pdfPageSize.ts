// (C) 2026 GoodData Corporation

import { type IExportDefinitionVisualizationObjectSettings } from "@gooddata/sdk-model";

type PdfPageSize = NonNullable<IExportDefinitionVisualizationObjectSettings["pageSize"]>;

/**
 * Returns the default PDF page size based on the format locale.
 *
 * @param formatLocale - The format locale to use.
 * @returns The default PDF page size.
 */
export function getDefaultPdfPageSize(formatLocale?: string): PdfPageSize {
    const normalizedLocale = formatLocale?.replace("_", "-");
    const region = normalizedLocale?.split("-")[1]?.toUpperCase();

    return region === "US" || region === "CA" ? "LETTER" : "A4";
}
