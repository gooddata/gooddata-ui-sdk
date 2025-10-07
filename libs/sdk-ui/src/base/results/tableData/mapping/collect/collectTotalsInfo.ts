// (C) 2019-2025 GoodData Corporation
import { ITotal, attributeLocalId, isAttribute } from "@gooddata/sdk-model";

import { IBucketsInfo } from "./collectBucketsInfo.js";

/**
 * @internal
 */
export type ITotalsInfo = {
    columnGrandTotals: ITotal[];
    columnSubtotals: ITotal[];
    rowGrandTotals: ITotal[];
    rowSubtotals: ITotal[];
};

/**
 * @internal
 */
export function collectTotalsInfo({ columnBucket, rowBucket }: IBucketsInfo) {
    const columnGrandTotals: ITotal[] = [];
    const columnSubtotals: ITotal[] = [];
    const rowGrandTotals: ITotal[] = [];
    const rowSubtotals: ITotal[] = [];

    if (columnBucket?.totals) {
        columnBucket.totals.forEach((total) => {
            const attributeIndex = columnBucket.items.findIndex(
                (item) => isAttribute(item) && attributeLocalId(item) === total.attributeIdentifier,
            );
            if (attributeIndex === 0) {
                columnGrandTotals.push(total);
            } else {
                columnSubtotals.push(total);
            }
        });
    }

    if (rowBucket?.totals) {
        rowBucket.totals.forEach((total) => {
            const attributeIndex = rowBucket.items.findIndex(
                (item) => isAttribute(item) && attributeLocalId(item) === total.attributeIdentifier,
            );
            if (attributeIndex === 0) {
                rowGrandTotals.push(total);
            } else {
                rowSubtotals.push(total);
            }
        });
    }

    return {
        columnGrandTotals,
        columnSubtotals,
        rowGrandTotals,
        rowSubtotals,
    };
}
