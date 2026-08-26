// (C) 2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type IAttributeDisplayFormMetadataObject } from "../../metadata/attributeDisplayForm/index.js";
import { type IComputedAttributeMetadataObject } from "../../metadata/computedAttribute/index.js";
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
