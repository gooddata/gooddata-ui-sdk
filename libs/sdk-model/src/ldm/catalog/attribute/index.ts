// (C) 2019-2020 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { IAttributeMetadataObject } from "../../metadata/attribute";
import { IAttributeDisplayFormMetadataObject } from "../../metadata/attributeDisplayForm";
import { IGroupableCatalogItemBase } from "../group";

/**
 * Type representing catalog attribute
 *
 * @public
 */
export interface ICatalogAttribute extends IGroupableCatalogItemBase {
    type: "attribute";
    attribute: IAttributeMetadataObject;
    defaultDisplayForm: IAttributeDisplayFormMetadataObject;
}

/**
 * Type guard checking whether the provided object is a {@link ICatalogAttribute}
 *
 * @public
 */
export function isCatalogAttribute(obj: any): obj is ICatalogAttribute {
    return !isEmpty(obj) && (obj as ICatalogAttribute).type === "attribute";
}
