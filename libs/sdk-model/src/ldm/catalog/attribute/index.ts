// (C) 2019-2025 GoodData Corporation
import { isEmpty } from "lodash-es";

import { IDataSetMetadataObject } from "../../../ldm/metadata/dataSet/index.js";
import { IAttributeMetadataObject } from "../../metadata/attribute/index.js";
import { IAttributeDisplayFormMetadataObject } from "../../metadata/attributeDisplayForm/index.js";
import { IGroupableCatalogItemBase } from "../group/index.js";

/**
 * Type representing catalog attribute
 *
 * @public
 */
export interface ICatalogAttribute extends IGroupableCatalogItemBase {
    /**
     * Catalog item type
     */
    type: "attribute";

    /**
     * Attribute metadata object that catalog attribute represents
     */
    attribute: IAttributeMetadataObject;

    /**
     * Attribute dataset
     */
    dataSet?: IDataSetMetadataObject;

    /**
     * Default display form of the attribute
     */
    defaultDisplayForm: IAttributeDisplayFormMetadataObject;

    /**
     * Display forms of the attribute
     */
    displayForms: IAttributeDisplayFormMetadataObject[];

    /**
     * Attribute's display forms that contain geo pins (lat; lng) pairs.
     */
    geoPinDisplayForms: IAttributeDisplayFormMetadataObject[];
}

/**
 * Type guard checking whether the provided object is a {@link ICatalogAttribute}
 *
 * @public
 */
export function isCatalogAttribute(obj: unknown): obj is ICatalogAttribute {
    return !isEmpty(obj) && (obj as ICatalogAttribute).type === "attribute";
}
