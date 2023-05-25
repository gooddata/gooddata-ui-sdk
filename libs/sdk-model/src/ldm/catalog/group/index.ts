// (C) 2019-2020 GoodData Corporation
import { ObjRef } from "../../../objRef/index.js";
import { ICatalogItemBase } from "../types.js";

/**
 * Catalog group can be used to group catalog items
 *
 * @public
 */
export interface ICatalogGroup {
    /**
     * Group title
     */
    title: string;

    /**
     * Tag reference that catalog group represents
     */
    tag: ObjRef;
}

/**
 * Properties contained in each groupable catalog item
 *
 * @public
 */
export interface IGroupableCatalogItemBase extends ICatalogItemBase {
    /**
     * Group tag references
     */
    groups: ObjRef[];
}
