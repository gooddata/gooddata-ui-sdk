// (C) 2019-2023 GoodData Corporation
import { IAfm } from "../executeAfm/GdcExecuteAFM.js";

/**
 * @public
 */
export interface IBaseExportConfig {
    /**
     * Specify title of the exported file.
     */
    title?: string;

    /**
     * Specify format of the exported file (default CSV).
     */
    format?: "xlsx" | "csv" | "raw";

    /**
     * When exporting to XLSX, specify whether to merge table headers or not.
     */
    mergeHeaders?: boolean;
}

/**
 * @public
 */
export interface IExportConfig extends IBaseExportConfig {
    /**
     * Indicate whether filters from the AFM should be included as meta-information in the
     * exported XSLX.
     */
    showFilters?: boolean;

    /**
     * When `showFilters` is true, then include AFM that was used to create execution whose data are being
     * exported.
     */
    afm?: IAfm;
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
export interface IExportResponse {
    /** URI from which can the export be fetched again */
    uri: string;
    /** Object URL pointing to the downloaded blob of exported data */
    objectUrl: string;
    /** Name of the exported file provided by the export service */
    fileName?: string;
}
