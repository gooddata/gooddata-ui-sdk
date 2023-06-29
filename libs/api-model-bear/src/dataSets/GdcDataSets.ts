// (C) 2019-2020 GoodData Corporation
import { Uri, BooleanAsString } from "../aliases.js";
import { IObjectMeta } from "../meta/GdcMetadata.js";

/**
 * @public
 */
export interface IDataSetContent {
    attributes: Uri[];
    facts: Uri[];
    dataLoadingColumns: Uri[];
    mode: "SLI" | "DLI" | "";
    urn?: string;
    identifierPrefix?: string;
    titleSuffix?: string;

    ties: Uri[]; // Left here only due to backwards compatibility, ignored otherwise.
    hasUploadConfiguration?: BooleanAsString;
    customUploadTimestamp?: number;
    customUploadIdentifier?: string;
    customUploadState?: string;
}

/**
 * @public
 */
export interface IDataSet {
    meta: IObjectMeta;
    content: IDataSetContent;
    links?: {
        dataUploads: Uri | null; // Link to data_uploads resource, NULL if there is not one
        uploadConfiguration?: Uri; // Left here only due to backwards compatibility, ignored otherwise.
    };
}

/**
 * @public
 */
export interface IWrappedDataSet {
    dataSet: IDataSet;
}
