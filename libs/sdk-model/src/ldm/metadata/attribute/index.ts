// (C) 2019-2022 GoodData Corporation
import { IMetadataObject, isMetadataObject } from "../types.js";
import { IAttributeDisplayFormMetadataObject } from "../attributeDisplayForm/index.js";
import { ObjRef } from "../../../objRef/index.js";

/**
 * Attribute metadata object
 *
 * @public
 */
export interface IAttributeMetadataObject extends IMetadataObject {
    type: "attribute";
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
