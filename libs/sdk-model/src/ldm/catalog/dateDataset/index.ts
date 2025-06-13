// (C) 2019-2025 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import { ICatalogItemBase } from "../types.js";
import { IAttributeMetadataObject } from "../../metadata/attribute/index.js";
import { IAttributeDisplayFormMetadataObject } from "../../metadata/attributeDisplayForm/index.js";
import { IDataSetMetadataObject } from "../../metadata/dataSet/index.js";
import { DateAttributeGranularity } from "../../../base/dateGranularities.js";

/**
 * Type representing catalog dateDataset date attribute
 *
 * @public
 */
export interface ICatalogDateAttribute {
    /**
     * Date attribute granularity
     */
    granularity: DateAttributeGranularity;

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
 * Type guard checking whether object is an instance of ICatalogDateDataset.
 *
 * @public
 */
export function isCatalogDateAttribute(obj: unknown): obj is ICatalogDateAttribute {
    const o = obj as ICatalogDateAttribute;
    return !isEmpty(obj) && Boolean(o.attribute && o.defaultDisplayForm && o.granularity);
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
export function isCatalogDateDataset(obj: unknown): obj is ICatalogDateDataset {
    return !isEmpty(obj) && (obj as ICatalogDateDataset).type === "dateDataset";
}
