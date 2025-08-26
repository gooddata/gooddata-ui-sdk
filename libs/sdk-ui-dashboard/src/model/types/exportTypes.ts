// (C) 2021-2025 GoodData Corporation

/**
 * @beta
 */
export interface ICsvExportConfig {
    format: "csv";
    title?: string;
}

/**
 * @beta
 */
export interface IXlsxExportConfig {
    format: "xlsx";
    /**
     * Specify title of the workbook.
     */
    title?: string;

    /**
     * Indicate whether headers and cells in the sheet
     * should be merged.
     */
    mergeHeaders?: boolean;

    /**
     * Specify filters to include as comments / metadata in the Excel sheet.
     *
     * @remarks
     * Filters provided here are purely to paint a better context for the
     * person looking at the XLSX file. They serve no other purpose and are merely serialized
     * into the XLSX in a human readable form.
     */
    showFilters?: boolean;
}

/**
 * @beta
 */
export interface IPdfExportConfig {
    format: "pdf";
    title?: string;
}

/**
 * @beta
 */
export type IExportConfig = ICsvExportConfig | IXlsxExportConfig | IPdfExportConfig;
