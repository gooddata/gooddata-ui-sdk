// (C) 2007-2019 GoodData Corporation
import { GdcMetadata } from "../meta/GdcMetadata";

/**
 *
 * @public
 */
export namespace GdcDateDataSets {
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
     * Response for POST \/gdc\/internal\/projects\/$\{projectId\}\/loadDateDatasets
     * @public
     */
    export interface IDateDataSetResponse {
        dateDataSetsResponse: {
            dateDataSets: IDateDataSet[];
            unavailableDateDataSetsCount?: number;
        };
    }
}
