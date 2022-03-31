// (C) 2019-2020 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { ICatalogItemBase } from "../types";
import { IAttributeMetadataObject } from "../../metadata/attribute";
import { IAttributeDisplayFormMetadataObject } from "../../metadata/attributeDisplayForm";
import { IDataSetMetadataObject } from "../../metadata/dataSet";
import { DateAttributeGranularity } from "../../../base/dateGranularities";

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
