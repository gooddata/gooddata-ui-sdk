// (C) 2019-2020 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import { IGroupableCatalogItemBase } from "../group/index.js";
import { IFactMetadataObject } from "../../metadata/fact/index.js";

/**
 * Type representing catalog fact
 *
 * @public
 */
export interface ICatalogFact extends IGroupableCatalogItemBase {
    /**
     * Catalog item type
     */
    type: "fact";

    /**
     * Fact metadata object that catalog fact represents
     */
    fact: IFactMetadataObject;
}

/**
 * Type guard checking whether the provided object is a {@link ICatalogFact}
 *
 * @public
 */
export function isCatalogFact(obj: unknown): obj is ICatalogFact {
    return !isEmpty(obj) && (obj as ICatalogFact).type === "fact";
}
