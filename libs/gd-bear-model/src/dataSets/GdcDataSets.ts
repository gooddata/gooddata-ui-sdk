// (C) 2019-2020 GoodData Corporation

import { GdcMetadata } from "../meta/GdcMetadata";
import { Uri, BooleanAsString } from "../aliases";

/**
 * @public
 */
export namespace GdcDataSets {
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

    export interface IDataSet {
        meta: GdcMetadata.IObjectMeta;
        content: IDataSetContent;
        links?: {
            dataUploads: Uri | null; // Link to data_uploads resource, NULL if there is not one
            uploadConfiguration?: Uri; // Left here only due to backwards compatibility, ignored otherwise.
        };
    }

    export interface IWrappedDataSet {
        dataSet: IDataSet;
    }
}
