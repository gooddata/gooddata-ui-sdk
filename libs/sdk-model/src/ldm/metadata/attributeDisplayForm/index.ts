// (C) 2019-2020 GoodData Corporation
import invariant from "ts-invariant";
import { ObjRef } from "../../../objRef";
import { IMetadataObject, isMetadataObject } from "../types";

/**
 * Attribute display form metadata object
 *
 * @public
 */
export interface IAttributeDisplayFormMetadataObject extends IMetadataObject {
    type: "displayForm";

    /**
     * A reference to the attribute that displayForm represents
     */
    attribute: ObjRef;

    /**
     * Subtype of the display form (e.g. GDC.geo.pin, or GDC.link)
     */
    displayFormType?: string;

    /**
     * Default display form of attribute.
     */
    isDefault?: boolean;
}

/**
 * Gets the attribute display form's ObjRef
 * @param displayForm - attribute display form to work with
 * @returns ObjRef of the attribute display form
 * @public
 */
export function attributeDisplayFormMetadataObjectRef(
    displayForm: IAttributeDisplayFormMetadataObject,
): ObjRef {
    invariant(displayForm, "displayForm must be specified");

    return displayForm.ref;
}

/**
 * Gets the attribute display form's title.
 * @param displayForm - attribute display form to work with
 * @returns title of the attribute display form
 * @public
 */
export function attributeDisplayFormMetadataObjectTitle(
    displayForm: IAttributeDisplayFormMetadataObject,
): string {
    invariant(displayForm, "displayForm must be specified");

    return displayForm.title;
}

/**
 * Gets ObjRef of the attribute the display form is a form of.
 *
 * @param displayForm - attribute display form to work with
 * @returns display form ObjRef
 * @public
 */
export function attributeDisplayFormMetadataObjectAttributeRef(
    displayForm: IAttributeDisplayFormMetadataObject,
): ObjRef {
    invariant(displayForm, "displayForm must be specified");

    return displayForm.attribute;
}

/**
 * Tests whether the provided object is of type {@link IAttributeDisplayFormMetadataObject}.
 *
 * @param obj - object to test
 * @public
 */
export function isAttributeDisplayFormMetadataObject(
    obj: unknown,
): obj is IAttributeDisplayFormMetadataObject {
    return isMetadataObject(obj) && obj.type === "displayForm";
}
