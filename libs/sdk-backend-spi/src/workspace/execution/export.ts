// (C) 2019 GoodData Corporation
import { IFilter } from "@gooddata/sdk-model";

/**
 * Configuration for exports of results into XLSX or CSV.
 *
 * @public
 */
export interface IExportConfig {
    /**
     * Format of the export file. Defaults to CSV if not specified.
     */
    format?: "xlsx" | "csv" | "raw";

    /**
     * Applicable for XLSX format; specifies title of the workbook.
     */
    title?: string;

    /**
     * Applicable for XLSX format; indicates whether headers and cells in the sheet
     * should be merged.
     */
    mergeHeaders?: boolean;

    /**
     * Applicable for XLSX format; specifies filters to include as comments / metadata in
     * the Excel sheet. Filters provided here are purely to paint a better context for the
     * person looking at the XLSX file. They serve no other purpose and are merely serialized
     * into the XLSX in a human readable form.
     */
    showFilters?: IFilter[];
}

/**
 * Result of export is a link to prepared file that can be downloaded.
 *
 * @public
 */
export interface IExportResult {
    uri: string;
}
