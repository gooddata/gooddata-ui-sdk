// (C) 2019-2025 GoodData Corporation

import { IFilter } from "@gooddata/sdk-model";

/**
 * Configuration for exports of results into tabular formats.
 *
 * @public
 */
export interface IExportConfig {
    /**
     * Format of the export file. Defaults to CSV if not specified.
     */
    format?: "xlsx" | "csv" | "raw" | "pdf";

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
     * Applicable for XLSX, and PDF format; specifies filters to include as comments / metadata in
     * the Excel sheet.
     *
     * @remarks
     * Filters provided here are purely to paint a better context for the
     * person looking at the exported file. They serve no other purpose and are merely serialized
     * in the export in a human-readable form.
     * The visualizationObjectId has to be provided to make this work for PDF format.
     */
    showFilters?: boolean;

    /**
     * Applicable for PDF format; specifies configuration for PDF export.
     */
    pdfConfiguration?: IExportPdfConfig;

    /**
     * Visualization object identifier. Used to ensure the export result is generated based on
     * existing visualization in the PDF document. (PDF only)
     */
    visualizationObjectId?: string;

    /**
     * Optional custom filters (as array of IFilter objects defined in UI SDK) to be applied
     * when visualizationObject is given. (PDF only)
     */
    visualizationObjectCustomFilters?: Array<IFilter>;
}

/**
 * Configuration for PDF export.
 *
 * @public
 */
export interface IExportPdfConfig {
    /** Page size and orientation (e.g. 'a4 landscape'). */
    pdfPageSize?: string;
    /** PDF top left header content. */
    pdfTopLeftContent?: string;
    /** PDF top right header content. */
    pdfTopRightContent?: string;
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
