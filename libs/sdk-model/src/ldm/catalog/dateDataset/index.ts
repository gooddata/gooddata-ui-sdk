// (C) 2019-2020 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { ICatalogItemBase } from "../types";
import { IAttributeMetadataObject } from "../../metadata/attribute";
import { IAttributeDisplayFormMetadataObject } from "../../metadata/attributeDisplayForm";
import { IDataSetMetadataObject } from "../../metadata/dataSet";

/**
 * Type representing catalog date attribute granularity
 *
 * @public
 */
export type CatalogDateAttributeGranularity =
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
 * Type representing catalog dateDataset date attribute
 *
 * @public
 */
export interface ICatalogDateAttribute {
    /**
     * Date attribute granularity
     */
    granularity: CatalogDateAttributeGranularity;

    /**
     * Date attribute metadata object
     */
    attribute: IAttributeMetadataObject;

    /**
     * Date attribute default display form metadata object
     */
    defaultDisplayForm: IAttributeDisplayFormMetadataObject;
}

/**
 * Type representing catalog date dataset
 *
 * @public
 */
export interface ICatalogDateDataset extends ICatalogItemBase {
    /**
     * Catalog item type
     */
    type: "dateDataset";

    /**
     * Date dataset relevance - higher is more, default relevance is 0
     */
    relevance: number;

    /**
     * Date dataset date attributes
     */
    dateAttributes: ICatalogDateAttribute[];

    /**
     * Dataset metadata object that catalog date dataset represents
     */
    dataSet: IDataSetMetadataObject;
}

/**
 * Type guard checking whether object is an instance of ICatalogDateDataset.
 *
 * @public
 */
export function isCatalogDateDataset(obj: any): obj is ICatalogDateDataset {
    return !isEmpty(obj) && (obj as ICatalogDateDataset).type === "dateDataset";
}
