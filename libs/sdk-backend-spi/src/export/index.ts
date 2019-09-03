// (C) 2019 GoodData Corporation
import { IFilter } from "@gooddata/sdk-model";

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IExportConfig {
    title?: string;
    format?: "xlsx" | "csv" | "raw";
    mergeHeaders?: boolean;
    showFilters?: IFilter;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IExportResult {
    uri: string;
}
