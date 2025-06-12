// (C) 2021-2022 GoodData Corporation
import { ICatalogDateDataset, ICatalogDateAttribute } from "@gooddata/sdk-model";

import { ObjRefMap, ObjRefMapConfig } from "../metadata/objRefMap.js";

/**
 * @internal
 */
export type CatalogDateAttributeWithDataset = {
    readonly attribute: ICatalogDateAttribute;
    readonly dataset: ICatalogDateDataset;
};

/**
 * Creates an {@link ObjRefMap} mapping date attribute ObjRef to an entry that contains the date attribute and the date dataset to which it belongs
 *
 * @param items - items to add to mapping
 * @param strictTypeCheck - whether to do strict type checking in idRefs
 * @internal
 */
export function newCatalogDateAttributeWithDatasetMap(
    items: ReadonlyArray<CatalogDateAttributeWithDataset>,
    strictTypeCheck: boolean = false,
): ObjRefMap<CatalogDateAttributeWithDataset> {
    const config: ObjRefMapConfig<CatalogDateAttributeWithDataset> = {
        type: "attribute",
        strictTypeCheck,
        idExtract: (i) => i.attribute.attribute.id,
        uriExtract: (i) => i.attribute.attribute.uri,
        refExtract: (i) => i.attribute.attribute.ref,
    };
    const map = new ObjRefMap<CatalogDateAttributeWithDataset>(config);

    return map.fromItems(items);
}
