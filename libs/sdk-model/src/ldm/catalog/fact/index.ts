// (C) 2019-2026 GoodData Corporation

import { _isEmpty } from "@gooddata/util";

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
    return !_isEmpty(obj) && (obj as ICatalogFact).type === "fact";
}
