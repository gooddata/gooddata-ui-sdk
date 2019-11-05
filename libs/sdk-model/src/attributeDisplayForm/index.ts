// (C) 2019 GoodData Corporation
import { Identifier, ObjRef, isUriRef, isIdentifierRef } from "../base";

/**
 * Attribute display form is a way that elements of a certain attribute can be represented.
 * For example an attribute representing Employee can have a display form that shows Employee's ID
 * and another one that shows their full name.
 * @public
 */
export interface IAttributeDisplayForm {
    /**
     * Reference to the related attribute.
     *
     * The attribute can be referenced by either URL of the attribute resource on backend OR by
     * unique, backend-recognized, identifier of the attribute.
     *
     * Note: specifying attributes by URI is discouraged and WILL be deprecated in the future. The
     * specification of URL has several drawbacks:
     *
     * -  Attribute URLs are tied to particular analytical workspace; this makes any application that uses
     *    URL-specified attributes workspace-specific.
     * -  Attribute URLs are not supported by all GoodData backends == this makes any application that uses
     *    URL-specified attribute backend-specific
     */
    attribute: ObjRef;
    /**
     * Id of the attribute display form. The value is used to reference model elements independently of their URIs.
     */
    id: Identifier;

    /**
     * User friendly name of the attribute display form.
     */
    title: string;
}

/**
 * Gets the attribute display form's id.
 * @param displayForm - attribute display form to work with, may be undefined == result is undefined
 * @returns id of the attribute display form
 * @public
 */
export function attributeDisplayFormId(displayForm: IAttributeDisplayForm): string | undefined {
    if (!displayForm) {
        return undefined;
    }

    return displayForm.id;
}

/**
 * Gets the attribute display form's title.
 * @param displayForm - attribute display form to work with, may be undefined == result is undefined
 * @returns title of the attribute display form
 * @public
 */
export function attributeDisplayFormTitle(displayForm: IAttributeDisplayForm): string | undefined {
    if (!displayForm) {
        return undefined;
    }

    return displayForm.title;
}

/**
 * Gets URI of attribute display form to use and get attribute element values from.
 *
 * @param displayForm - attribute display form to work with, may be undefined == result is undefined
 * @returns display form URI as string, undefined if display form not specified using URI
 * @public
 */
export function attributeDisplayFormUri(displayForm: IAttributeDisplayForm): string | undefined {
    if (!displayForm) {
        return undefined;
    }

    return isUriRef(displayForm.attribute) ? displayForm.attribute.uri : undefined;
}

/**
 * Gets identifier of attribute display form to use and get attribute element values from.
 *
 * @param attribute - attribute display form to work with, may be undefined == result is undefined
 * @returns display form identifier as string, undefined if display for not specified using identifier
 * @public
 */
export function attributeDisplayFormIdentifier(displayForm: IAttributeDisplayForm): string | undefined {
    if (!displayForm) {
        return undefined;
    }

    return isIdentifierRef(displayForm.attribute) ? displayForm.attribute.identifier : undefined;
}
