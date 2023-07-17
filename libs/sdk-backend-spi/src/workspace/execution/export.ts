// (C) 2019-2023 GoodData Corporation

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
     * the Excel sheet.
     *
     * @remarks
     * Filters provided here are purely to paint a better context for the
     * person looking at the XLSX file. They serve no other purpose and are merely serialized
     * into the XLSX in a human readable form.
     */
    showFilters?: boolean;
}

/**
 * Result of export is an object URL pointing to a Blob of downloaded data attached to the current
 * window instance. The result also contains name of the downloaded file provided by the backend export
 * service.
 *
 * {@link URL#revokeObjectURL} method must be used when object URL is no longer needed to release
 * the blob memory.
 *
 * @public
 */
export interface IExportResult {
    /** URI from which can the export be fetched again */
    uri: string;
    /** Object URL pointing to the downloaded blob of exported data */
    objectUrl: string;
    /** Name of the exported file provided by the export service */
    fileName?: string;
}
