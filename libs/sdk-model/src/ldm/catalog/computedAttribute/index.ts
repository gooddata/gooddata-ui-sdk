// (C) 2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type IAttributeMetadataObject } from "../../metadata/attribute/index.js";
import { type IAttributeDisplayFormMetadataObject } from "../../metadata/attributeDisplayForm/index.js";
import { type IComputedAttributeMetadataObject } from "../../metadata/computedAttribute/index.js";
import { type ICatalogAttribute } from "../attribute/index.js";
import { type IGroupableCatalogItemBase } from "../group/index.js";

/**
 * Type representing catalog computed attribute.
 *
 * @remarks
 * Shaped after {@link ICatalogAttribute} so it can be listed and dragged among
 * normal attributes; `defaultDisplayForm` is the fabricated display form of the
 * computed attribute (see {@link IComputedAttributeMetadataObject}).
 *
 * @public
 */
export interface ICatalogComputedAttribute extends IGroupableCatalogItemBase {
    /**
     * Catalog item type
     */
    type: "computedAttribute";

    /**
     * Computed attribute metadata object that this catalog item represents
     */
    computedAttribute: IComputedAttributeMetadataObject;

    /**
     * Default (and only) display form of the computed attribute
     */
    defaultDisplayForm: IAttributeDisplayFormMetadataObject;

    /**
     * Display forms of the computed attribute
     */
    displayForms: IAttributeDisplayFormMetadataObject[];
}

/**
 * Type guard checking whether the provided object is a {@link ICatalogComputedAttribute}
 *
 * @public
 */
export function isCatalogComputedAttribute(obj: unknown): obj is ICatalogComputedAttribute {
    return !isEmpty(obj) && (obj as ICatalogComputedAttribute).type === "computedAttribute";
}

/**
 * Adapts a computed attribute to the attribute metadata surface.
 *
 * @remarks
 * Only the `type` discriminator is rewritten - the ref, the fabricated display form and the rest of
 * the metadata are kept verbatim. The result therefore CLAIMS to be a plain attribute while its
 * `ref.type` still says `computedAttribute`; the ref is the honest signal, not the `type`. Use it
 * where attribute-shaped consumers must also handle computed attributes.
 *
 * @beta
 */
export function computedAttributeAsAttributeMetadataObject(
    computedAttribute: IComputedAttributeMetadataObject,
): IAttributeMetadataObject {
    return {
        ...computedAttribute,
        type: "attribute",
    };
}

/**
 * Adapts a catalog computed attribute to a catalog attribute so it can enter attribute-shaped
 * resolution maps and listings.
 *
 * @remarks
 * Refs stay honest (typed `computedAttribute`); only the catalog item and metadata object `type`
 * discriminators are rewritten. See {@link computedAttributeAsAttributeMetadataObject}.
 *
 * @beta
 */
export function catalogComputedAttributeAsCatalogAttribute(
    item: ICatalogComputedAttribute,
): ICatalogAttribute {
    return {
        type: "attribute",
        attribute: computedAttributeAsAttributeMetadataObject(item.computedAttribute),
        defaultDisplayForm: item.defaultDisplayForm,
        displayForms: item.displayForms,
        geoPinDisplayForms: [],
        groups: item.groups,
    };
}
