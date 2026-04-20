// (C) 2019-2026 GoodData Corporation

import { InvariantError, invariant } from "ts-invariant";

import { attributeLocalId, isAttribute } from "../attribute/index.js";
import { isMeasure, measureLocalId } from "../measure/index.js";
import { type IAttributeOrMeasure } from "./index.js";

/**
 * Gets value of local identifier of bucketItem
 *
 * @param bucketItem - bucketItem to work with
 * @returns value of local identifier
 * @public
 */
export function bucketItemLocalId(bucketItem: IAttributeOrMeasure): string {
    invariant(bucketItem, "bucketItem must be specified");
    if (isAttribute(bucketItem)) {
        return attributeLocalId(bucketItem);
    }
    if (isMeasure(bucketItem)) {
        return measureLocalId(bucketItem);
    }

    throw new InvariantError(`Unknown bucketItem "${bucketItem}"`);
}
