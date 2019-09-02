// (C) 2019 GoodData Corporation
import { IFilter } from "@gooddata/sdk-model";

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IBaseExportConfig {
    title?: string;
    format?: "xlsx" | "csv" | "raw";
    mergeHeaders?: boolean;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IExportConfig extends IBaseExportConfig {
    showFilters?: IFilter;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IExportResponse {
    uri: string;
}
