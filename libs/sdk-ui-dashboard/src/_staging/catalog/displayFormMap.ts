// (C) 2021-2025 GoodData Corporation

import { type IWorkspaceCatalog } from "@gooddata/sdk-backend-spi";
import {
    type IAttributeDisplayFormMetadataObject,
    type ICatalogAttribute,
    type ICatalogDateDataset,
} from "@gooddata/sdk-model";

import { type ObjRefMap, newDisplayFormMap } from "../metadata/objRefMap.js";

/**
 * Factory function that extracts all display forms from catalog entities and returns a map indexing display
 * form `ref` to display form metadata object.
 *
 * The lookups into the map can be done by any type of ObjRef.
 *
 * @param attributes - catalog attributes
 * @param dateDatasets - catalog date datasets
 * @param strictTypeChecking - indicate whether strict type checking should be done using 'type' property of input `idRef`; default is false - the type information will be ignored
 * @alpha
 */
export function createDisplayFormMap(
    attributes: ICatalogAttribute[],
    dateDatasets: ICatalogDateDataset[],
    strictTypeChecking: boolean = false,
): ObjRefMap<IAttributeDisplayFormMetadataObject> {
    const nonDateDisplayForms = attributes.flatMap((a) => [...a.displayForms, ...a.geoPinDisplayForms]);
    const dateDisplayForms = dateDatasets.flatMap((d) =>
        d.dateAttributes.flatMap((a) => a.attribute.displayForms),
    );

    return newDisplayFormMap([...nonDateDisplayForms, ...dateDisplayForms], strictTypeChecking);
}

/**
 * Factory function that extracts all display forms from workspace catalog and returns a map indexing
 * display form's `ref` to display form metadata object.
 *
 * The lookups into the map can be done by any type of ObjRef.
 *
 * @param catalog - workspace catalog
 * @param strictTypeChecking - indicate whether strict type checking should be done using 'type' property of input `idRef`; default is false - the type information will be ignored
 * @alpha
 */
export function createDisplayFormMapFromCatalog(
    catalog: IWorkspaceCatalog,
    strictTypeChecking: boolean = false,
): ObjRefMap<IAttributeDisplayFormMetadataObject> {
    return createDisplayFormMap(catalog.attributes(), catalog.dateDatasets(), strictTypeChecking);
}
