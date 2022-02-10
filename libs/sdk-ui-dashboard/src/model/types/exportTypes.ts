// (C) 2021-2022 GoodData Corporation

/**
 * @alpha
 */
export interface ICsvExportConfig {
    format: "csv";
}

/**
 * @alpha
 */
export interface IXlsxExportConfig {
    format: "xlsx";
    /**
     * Optionally specify title of the workbook.
     */
    title?: string;

    /**
     * Optionally indicate whether headers and cells in the sheet
     * should be merged.
     */
    mergeHeaders?: boolean;

    /**
     * Optionally specify filters to include as comments / metadata in
     * the Excel sheet. Filters provided here are purely to paint a better context for the
     * person looking at the XLSX file. They serve no other purpose and are merely serialized
     * into the XLSX in a human readable form.
     */
    showFilters?: boolean;
}

/**
 * @alpha
 */
export type IExportConfig = ICsvExportConfig | IXlsxExportConfig;
