// (C) 2007-2020 GoodData Corporation
import { GdcMetadata } from "../meta/GdcMetadata";
/**
 *
 * @public
 */
export namespace GdcDateDataSets {
    export type IDateDataSetAttributeGranularity =
        | "GDC.time.year"
        | "GDC.time.week_us"
        | "GDC.time.week_in_year"
        | "GDC.time.week_in_quarter"
        | "GDC.time.week"
        | "GDC.time.euweek_in_year"
        | "GDC.time.euweek_in_quarter"
        | "GDC.time.quarter"
        | "GDC.time.quarter_in_year"
        | "GDC.time.month"
        | "GDC.time.month_in_quarter"
        | "GDC.time.month_in_year"
        | "GDC.time.day_in_year"
        | "GDC.time.day_in_quarter"
        | "GDC.time.day_in_month"
        | "GDC.time.day_in_week"
        | "GDC.time.day_in_euweek"
        | "GDC.time.date";

    /**
     * TODO: SDK8 add docs
     *
     * @public
     */
    export interface IDateDataSetAttribute {
        attributeMeta: GdcMetadata.IObjectMeta;
        defaultDisplayFormMeta: GdcMetadata.IObjectMeta;
        type: IDateDataSetAttributeGranularity;
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
