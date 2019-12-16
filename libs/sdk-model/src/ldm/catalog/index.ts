// (C) 2019 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { IObjectMeta } from "../../common/objectMeta";

/**
 * Type representing catalog item type - attribute, measure, fact or dateDataset
 *
 * @public
 */
export type CatalogItemType = "attribute" | "measure" | "fact" | "dateDataset";

/**
 * Catalog group can be used to group catalog items
 *
 * @public
 */
export interface ICatalogGroup {
    readonly title: string;
    readonly id: string;
}

/**
 * Properties contained in each catalog item
 *
 * @public
 */
export interface ICatalogItemBase extends IObjectMeta {
    readonly type: CatalogItemType;
}

/**
 * Properties contained in each groupable catalog item
 *
 * @public
 */
export interface IGroupableCatalogItemBase extends ICatalogItemBase {
    readonly groups: string[];
}

/**
 * Type representing catalog attribute
 *
 * @public
 */
export interface ICatalogAttribute extends IGroupableCatalogItemBase {
    readonly type: "attribute";
    readonly defaultDisplayForm: IObjectMeta;
}

/**
 * Type guard checking whether the provided object is a {@link ICatalogAttribute}
 *
 * @public
 */
export function isCatalogAttribute(obj: any): obj is ICatalogAttribute {
    return !isEmpty(obj) && (obj as ICatalogAttribute).type === "attribute";
}

/**
 * Type representing catalog measure
 *
 * @public
 */
export interface ICatalogMeasure extends IGroupableCatalogItemBase {
    readonly type: "measure";
    readonly expression: string;
    readonly format: string;
}

/**
 * Type guard checking whether CatalogItem is an instance of ICatalogMeasure.
 *
 * @public
 */
export function isCatalogMeasure(obj: any): obj is ICatalogMeasure {
    return !isEmpty(obj) && (obj as ICatalogMeasure).type === "measure";
}

/**
 * Type representing catalog fact
 *
 * @public
 */
export interface ICatalogFact extends IGroupableCatalogItemBase {
    readonly type: "fact";
}

/**
 * Type guard checking whether CatalogItem is an instance of ICatalogFact.
 *
 * @public
 */
export function isCatalogFact(obj: any): obj is ICatalogFact {
    return !isEmpty(obj) && (obj as ICatalogFact).type === "fact";
}

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
    | "GDC.time.month"
    | "GDC.time.quarter"
    | "GDC.time.date";

/**
 * Type representing catalog dateDataset date attribute
 *
 * @public
 */
export interface ICatalogDateAttribute {
    readonly granularity: CatalogDateAttributeGranularity;
    readonly attribute: IObjectMeta;
    readonly defaultDisplayForm: IObjectMeta;
}

/**
 * Type representing catalog dateDataset
 *
 * @public
 */
export interface ICatalogDateDataset extends ICatalogItemBase {
    readonly type: "dateDataset";
    readonly relevance: number;
    readonly dateAttributes: ICatalogDateAttribute[];
}

/**
 * Type guard checking whether CatalogItem is an instance of ICatalogDateDataset.
 *
 * @public
 */
export function isCatalogDateDataset(obj: any): obj is ICatalogDateDataset {
    return !isEmpty(obj) && (obj as ICatalogDateDataset).type === "dateDataset";
}

/**
 * Type representing catalog item - attribute, measure, fact or dateDataset
 *
 * @public
 */
export type CatalogItem = ICatalogAttribute | ICatalogMeasure | ICatalogFact | ICatalogDateDataset;
