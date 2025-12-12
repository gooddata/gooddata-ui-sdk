// (C) 2019-2025 GoodData Corporation
import { isEmpty } from "lodash-es";

import { type IFactMetadataObject } from "../../metadata/fact/index.js";
import { type IGroupableCatalogItemBase } from "../group/index.js";

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
