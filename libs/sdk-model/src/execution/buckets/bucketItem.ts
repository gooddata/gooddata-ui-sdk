// (C) 2019-2020 GoodData Corporation
import { isAttribute, attributeLocalId } from "../attribute";
import { IAttributeOrMeasure } from ".";

import { isMeasure, measureLocalId } from "../measure";

import invariant, { InvariantError } from "ts-invariant";

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
