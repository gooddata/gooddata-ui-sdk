// (C) 2019-2022 GoodData Corporation
import { GdcExecuteAFM } from "../executeAfm/GdcExecuteAFM";

/**
 *
 * @public
 */
export namespace GdcExport {
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
        afm?: GdcExecuteAFM.IAfm;
    }

    /**
     * @public
     */
    export interface IExportResponse {
        uri: string;
    }
}
