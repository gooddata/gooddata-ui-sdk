// (C) 2019-2020 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { IGroupableCatalogItemBase } from "../group";
import { IFactMetadataObject } from "../../metadata/fact";

/**
 * Type representing catalog attribute
 *
 * @public
 */
export interface ICatalogFact extends IGroupableCatalogItemBase {
    type: "fact";
    fact: IFactMetadataObject;
}

/**
 * Type guard checking whether the provided object is a {@link ICatalogFact}
 *
 * @public
 */
export function isCatalogFact(obj: any): obj is ICatalogFact {
    return !isEmpty(obj) && (obj as ICatalogFact).type === "fact";
}
