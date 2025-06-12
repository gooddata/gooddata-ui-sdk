// (C) 2019-2023 GoodData Corporation
import { Identifier, isUriRef, ObjRef, isIdentifierRef } from "../../objRef/index.js";
import isEmpty from "lodash/isEmpty.js";
import { invariant } from "ts-invariant";

/**
 * Attribute is our nomenclature for 'dimension' as typically used in multi-dimensional BI modeling.
 *
 * @remarks
 * The attribute specifies on what dimension to slice/dice the measures.
 *
 * In GoodData, each attribute can have multiple different display forms. Display forms essentially provide different
 * representations for elements in the dimension.
 *
 * @public
 */
export interface IAttributeBody {
    /**
     * User-assigned id of the attribute. The value is used to cross-reference model elements that are part
     * of an execution.
     *
     * The constraint is that the local identifiers of all measures and attributes in an execution definition MUST
     * be unique.
     */
    localIdentifier: Identifier;

    /**
     * Reference to display form to use for element representations.
     *
     * The display form can be referenced by either URL of the display form resource on backend OR by
     * unique, backend-recognized, identifier of the display form.
     *
     * Note: specifying display forms by URI is discouraged and WILL be deprecated in the future. The
     * specification of URL has several drawbacks:
     *
     * -  Display form URLs are tied to particular analytical workspace; this makes any application that uses
     *    URL-specified display forms workspace-specific.
     * -  Display form URLs are not supported by all GoodData backends == this makes any application that uses
     *    URL-specified display form backend-specific
     */
    displayForm: ObjRef;

    /**
     * This is user-assigned alias of the attribute; it is opaque for the backend. When backend returns
     * metadata about execution results, it WILL include this user-assigned alias in the metadata.
     */
    alias?: string;

    /**
     * Indicates whether to show all values of given attribute even if the data bound to those values
     * are not available
     */
    showAllValues?: boolean;
}

/**
 * Attribute is our nomenclature for 'dimension' as typically used in multi-dimensional BI modeling.
 *
 * @remarks
 * The attribute specifies on what dimension to slice/dice the measures.
 *
 * In GoodData, each attribute can have multiple different display forms. Display forms essentially provide different
 * representations for elements in the dimension.
 *
 * @public
 */
export interface IAttribute {
    attribute: IAttributeBody;
}

/**
 * Type guard checking whether object is an instance of IAttribute.
 *
 * @public
 */
export function isAttribute(obj: unknown): obj is IAttribute {
    return !isEmpty(obj) && (obj as IAttribute).attribute !== undefined;
}

/**
 * Defines function signature for measure predicates.
 *
 * @public
 */
export type AttributePredicate = (attribute: IAttribute) => boolean;

/**
 * Predicate that returns true for any attribute.
 *
 * @public
 */
export const anyAttribute: AttributePredicate = (_) => true;

/**
 * Factory function for attribute predicate which evaluates true for attributes that match particular ID.
 *
 * @public
 */
export const idMatchAttribute: (id: string) => AttributePredicate = (id) => (attr) =>
    attr.attribute.localIdentifier === id;

//
//
//

/**
 * Gets local identifier of an attribute.
 *
 * @remarks
 * For convenience and fluency, this function accepts both attribute object and identifier.
 *
 * @param attributeOrId - attribute to work with or the identifier
 * @returns value of local identifier
 * @public
 */
export function attributeLocalId(attributeOrId: IAttribute | Identifier): string {
    invariant(attributeOrId, "attribute must be specified");

    return typeof attributeOrId === "string" ? attributeOrId : attributeOrId.attribute.localIdentifier;
}

/**
 * Gets URI of attribute's display form to use and get attribute element values from.
 *
 * @param attribute - attribute to work with, may be undefined == result is undefined
 * @returns display form URI as string, undefined if display form not specified using URI
 * @public
 */
export function attributeUri(attribute: IAttribute): string | undefined {
    invariant(attribute, "attribute must be specified");

    return isUriRef(attribute.attribute.displayForm) ? attribute.attribute.displayForm.uri : undefined;
}

/**
 * Gets identifier of attribute's display form to use and get attribute element values from.
 *
 * @param attribute - attribute to work with, may be undefined == result is undefined
 * @returns display form identifier as string, undefined if display for not specified using identifier
 * @public
 */
export function attributeIdentifier(attribute: IAttribute): string | undefined {
    invariant(attribute, "attribute must be specified");

    return isIdentifierRef(attribute.attribute.displayForm)
        ? attribute.attribute.displayForm.identifier
        : undefined;
}

/**
 * Gets an attribute alias.
 *
 * @param attribute - attribute to work with
 * @returns value of attribute alias
 * @public
 */
export function attributeAlias(attribute: IAttribute): string | undefined {
    invariant(attribute, "attribute must be specified");

    return attribute.attribute.alias;
}

/**
 * Gets an attribute show all values property.
 *
 * @param attribute - attribute to work with
 * @returns value of attribute show all values property
 * @public
 */
export function attributeShowAllValues(attribute: IAttribute): boolean | undefined {
    invariant(attribute, "attribute must be specified");

    return attribute.attribute.showAllValues;
}

/**
 * Gets an attribute display form object ref.
 *
 * @param attribute - attribute to work with
 * @returns value of attribute display form object ref
 * @public
 */
export function attributeDisplayFormRef(attribute: IAttribute): ObjRef {
    invariant(attribute, "attribute must be specified");

    return attribute.attribute.displayForm;
}

/**
 * Given list of attributes, returns first-found attribute matching the provided predicate.
 *
 * @remarks
 * If no predicate is provided, then the function defaults to anyAttribute predicate - meaning first found attribute
 * will be returned.
 *
 * This function also provides convenience to find attribute by its local identifier - if you pass predicate as
 * string the function will automatically create idMatchAttribute predicate.
 *
 * @param attributes - list of attributes to work with, must be specified
 * @param idOrFun - attribute identifier or instance of AttributePredicate; {@link anyAttribute} predicate is default
 * @public
 */
export function attributesFind(
    attributes: IAttribute[],
    idOrFun: string | AttributePredicate = anyAttribute,
): IAttribute | undefined {
    invariant(attributes, "attributes must be specified");

    if (!attributes.length) {
        return;
    }

    const predicate = typeof idOrFun === "string" ? idMatchAttribute(idOrFun) : idOrFun;

    return attributes.find(predicate);
}
