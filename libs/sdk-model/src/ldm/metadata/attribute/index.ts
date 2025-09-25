// (C) 2019-2025 GoodData Corporation

import { ObjRef } from "../../../objRef/index.js";
import { IAttributeDisplayFormMetadataObject } from "../attributeDisplayForm/index.js";
import { IDataSetMetadataObject } from "../dataSet/index.js";
import { IMetadataObject, isMetadataObject } from "../types.js";

/**
 * Attribute metadata object
 *
 * @public
 */
export interface IAttributeMetadataObject extends IMetadataObject {
    type: "attribute";

    /**
     * Whether the attribute is locked for editing
     */
    isLocked?: boolean;

    /**
     * Dataset the attribute belongs to (if supplied by backend include)
     */
    dataSet?: IDataSetMetadataObject;

    /**
     * A reference to the attribute displayForm that represents implicit drill down step
     *
     * @remarks
     * Drilling of this type will be available in any report/dashboard where this attribute will be present.
     * This will be performed on attribute headers and attribute element headers. These will be defined in LDM.
     */
    drillDownStep?: ObjRef;

    /**
     * A reference to the attribute displayForm that represents implicit drill to url from attribute value
     *
     * @remarks
     * Drilling of this type will be available in any report/dashboard where this attribute will be present.
     * This will be performed on attribute headers and attribute element headers. These will be defined in LDM.
     */
    drillToAttributeLink?: ObjRef;

    /**
     * Display forms of the attribute
     */
    displayForms: IAttributeDisplayFormMetadataObject[];
}

/**
 * Tests whether the provided object is of type {@link IAttributeMetadataObject}.
 *
 * @param obj - object to test
 * @public
 */
export function isAttributeMetadataObject(obj: unknown): obj is IAttributeMetadataObject {
    return isMetadataObject(obj) && obj.type === "attribute";
}
