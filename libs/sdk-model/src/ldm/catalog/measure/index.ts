// (C) 2019-2025 GoodData Corporation
import { isEmpty } from "lodash-es";

import { type IMeasureMetadataObject } from "../../metadata/measure/index.js";
import { type IGroupableCatalogItemBase } from "../group/index.js";

/**
 * Type representing catalog measure
 *
 * @public
 */
export interface ICatalogMeasure extends IGroupableCatalogItemBase {
    /**
     * Catalog item type
     */
    type: "measure";

    /**
     * Measure metadata object that catalog measure represents
     */
    measure: IMeasureMetadataObject;
}

/**
 * Type guard checking whether the provided object is a {@link ICatalogMeasure}
 *
 * @public
 */
export function isCatalogMeasure(obj: unknown): obj is ICatalogMeasure {
    return !isEmpty(obj) && (obj as ICatalogMeasure).type === "measure";
}
