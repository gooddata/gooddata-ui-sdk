// (C) 2019-2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type IDataSetMetadataObject } from "../../../ldm/metadata/dataSet/index.js";
import { type IUnavailableReference } from "../../../objRef/unavailableReference.js";
import { type IAttributeMetadataObject } from "../../metadata/attribute/index.js";
import { type IAttributeDisplayFormMetadataObject } from "../../metadata/attributeDisplayForm/index.js";
import { type IGroupableCatalogItemBase } from "../group/index.js";

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

    /**
     * Referenced objects the current user may not read: the attribute hierarchies this attribute
     * belongs to.
     *
     * @remarks
     * Undefined when object permissions were not checked.
     *
     * @alpha
     */
    unavailable?: IUnavailableReference[];
}

/**
 * Type guard checking whether the provided object is a {@link ICatalogAttribute}
 *
 * @public
 */
export function isCatalogAttribute(obj: unknown): obj is ICatalogAttribute {
    return !isEmpty(obj) && (obj as ICatalogAttribute).type === "attribute";
}
