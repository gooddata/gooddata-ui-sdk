// (C) 2019 GoodData Corporation
import { GdcMetadata } from "../meta/GdcMetadata";

/**
 * @public
 */
export namespace GdcDataSets {
    /**
     * Represents the current status of CSV source.
     *
     * @public
     */
    export type DataSetLoadStatus =
        | "RUNNING"
        | "OK"
        | "ERROR"
        | "CANCELLED"
        | "ERROR_METADATA"
        | "REFRESHING";

    /**
     * Object wrapping info about the user that created CSV load. Contains their login and full name.
     *
     * @public
     */
    export interface IDataSetUser {
        login: string;
        fullName: string;
        profileUri: string;
    }

    /**
     * Object wrapping basic information (owner, date created, status) about a CSV Load.
     *
     * @public
     */
    export interface IDataSetLoadInfo {
        owner: IDataSetUser;
        status: DataSetLoadStatus;
        created: string;
    }

    /**
     * Represents type of LDM field created from the Dataset column.
     *
     * @public
     */
    export type DataColumnType = "ATTRIBUTE" | "FACT" | "DATE";

    /**
     * Dataset column with name, type and boolean flag whether the column
     * needs to be skipped while data loading or not.
     *
     * @public
     */
    export interface IDataColumn {
        column: {
            name: string;
            type: DataColumnType;
            skip?: boolean;
            format?: string;
        };
    }

    /**
     * Structural information about CSV header and columns. Indicates whether the CSV file
     * contains header or not and on which row. Also contains the list of CSV columns with
     * their names and types.
     *
     * @public
     */
    export interface IDataHeader {
        headerRowIndex?: number;
        columns: IDataColumn[];
    }

    /**
     * Dataset describes a particular structure of dataset (CSV file). There may be many Loads
     * related to a single dataset - meaning multiple files with the same structure and different data.
     *
     * @public
     */
    export interface IDataSet {
        dataset: {
            name: string;
            dataHeader: IDataHeader;
            dataSetId: string;
            loadedRowCount: number;
            dataSetLoadStatus: DataSetLoadStatus;
            firstSuccessfulUpdate?: IDataSetLoadInfo;
            lastSuccessfulUpdate?: IDataSetLoadInfo;
            lastUpdate?: IDataSetLoadInfo;
        };
    }

    /**
     * @public
     */
    export interface IDataSetResponse {
        datasets: {
            items: IDataSet[];
        };
    }

    /**
     * TODO: SDK8 add docs
     *
     * @public
     */
    export interface IDateDataSetAttribute {
        attributeMeta: GdcMetadata.IObjectMeta;
        defaultDisplayFormMeta: GdcMetadata.IObjectMeta;
        type: string;
    }

    /**
     * TODO: SDK8 add docs
     *
     * @public
     */
    export interface IDateDataSet {
        relevance: number;
        availableDateAttributes?: IDateDataSetAttribute[];
        meta: GdcMetadata.IObjectMeta;
    }

    /**
     * TODO: SDK8 add docs
     *
     * @public
     */
    export interface IDateDataSetResponseContent {
        dateDataSets: IDateDataSet[];
        unavailableDateDataSetsCount?: number;
    }

    /**
     * TODO: SDK8 add docs
     *
     * @public
     */
    export interface IDateDataSetResponse {
        dateDataSetsResponse: IDateDataSetResponseContent;
    }
}
