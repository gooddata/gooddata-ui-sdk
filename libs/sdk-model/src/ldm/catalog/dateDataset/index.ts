// (C) 2019-2020 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { ICatalogItemBase } from "../types";
import { IAttributeMetadataObject } from "../../metadata/attribute";
import { IAttributeDisplayFormMetadataObject } from "../../metadata/attributeDisplayForm";
import { IDataSetMetadataObject } from "../../metadata/dataSet";

/**
 * Type representing catalog date attribute date type
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
    granularity: CatalogDateAttributeGranularity;
    attribute: IAttributeMetadataObject;
    defaultDisplayForm: IAttributeDisplayFormMetadataObject;
}

/**
 * Type representing catalog dateDataset
 *
 * @public
 */
export interface ICatalogDateDataset extends ICatalogItemBase {
    type: "dateDataset";
    relevance: number;
    dateAttributes: ICatalogDateAttribute[];
    dataSet: IDataSetMetadataObject;
}

/**
 * Type guard checking whether CatalogItem is an instance of ICatalogDateDataset.
 *
 * @public
 */
export function isCatalogDateDataset(obj: any): obj is ICatalogDateDataset {
    return !isEmpty(obj) && (obj as ICatalogDateDataset).type === "dateDataset";
}
