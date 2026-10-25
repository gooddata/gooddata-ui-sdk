// (C) 2026 GoodData Corporation

import { type ITotal } from "@gooddata/sdk-model";

import { type IBucketItem } from "../../../typings/metadata.js";

/**
 * Totals sanitization, over totals and bucket items.
 *
 * The rules: a grand total (a total attached to the FIRST attribute of its bucket)
 * follows the first attribute wherever it moves; a subtotal is identified by the attribute it sits
 * "within" (the one before it) and is dropped when that attribute leaves the bucket or becomes the
 * last one; totals whose measure is gone are dropped.
 */

/**
 * Reorders totals to match the order of measures, but only within the same aggregate function.
 * Preserves the original order of different aggregate functions (sum, max, min, etc.)
 * but ensures totals with the same function are ordered by measure position.
 */
export function reorderTotalsByMeasures(totals: ITotal[], measures: IBucketItem[]): ITotal[] {
    if (!totals.length || !measures.length) {
        return totals;
    }

    // Group totals by aggregate function type, preserving original order of functions
    const totalsByFunction = new Map<string, ITotal[]>();
    const functionOrder: string[] = [];

    totals.forEach((total) => {
        if (!totalsByFunction.has(total.type)) {
            totalsByFunction.set(total.type, []);
            functionOrder.push(total.type);
        }
        totalsByFunction.get(total.type).push(total);
    });

    // Within each function group, sort by measure order
    const getMeasureOrder = (total: ITotal): number => {
        return measures.findIndex((m) => m.localIdentifier === total.measureIdentifier);
    };

    const reorderedTotals: ITotal[] = [];
    functionOrder.forEach((functionType) => {
        const functionTotals = totalsByFunction.get(functionType);
        const sortedFunctionTotals = functionTotals.sort((a, b) => {
            return getMeasureOrder(a) - getMeasureOrder(b);
        });
        reorderedTotals.push(...sortedFunctionTotals);
    });

    return reorderedTotals;
}

/**
 * Sanitizes one bucket's totals against the attribute list it had before and the attribute list it
 * has now: drops the totals whose measure disappeared, re-points or drops the rest per
 * {@link sanitizeTotal}, and optionally reorders same-function totals by measure position.
 */
export function sanitizeBucketTotals(
    totals: ITotal[],
    attributes: IBucketItem[],
    previousAttributes: IBucketItem[],
    measures: IBucketItem[],
    reorderByMeasures: boolean,
): ITotal[] {
    const sanitized = totals
        .filter((total) => measures.some((measure) => measure.localIdentifier === total.measureIdentifier))
        .reduce((newTotals: ITotal[], total) => {
            const sanitizedTotal = sanitizeTotal(total, attributes, previousAttributes);
            return sanitizedTotal === null ? newTotals : newTotals.concat(sanitizedTotal);
        }, []);

    return reorderByMeasures ? reorderTotalsByMeasures(sanitized, measures) : sanitized;
}

function sanitizeTotal(
    total: ITotal,
    rowAttributes: IBucketItem[],
    previousRowAttributes: IBucketItem[],
): ITotal {
    if (!rowAttributes || !total) {
        return null;
    }

    const wasGrandTotal = isGrandTotal(previousRowAttributes, total);
    const wasSubtotal = previousRowAttributes.length > 0 && !wasGrandTotal;

    if (wasGrandTotal) {
        return processGrandTotal(rowAttributes, total);
    } else if (wasSubtotal) {
        return processSubtotal(total, previousRowAttributes, rowAttributes);
    }
    return total; // grand total or subtotal with no history that does not need to be modified
}

function isGrandTotal(rowAttributes: IBucketItem[], total: ITotal): boolean {
    const rowAttributeIndex = rowAttributes.findIndex(
        (rowAttribute) => rowAttribute.localIdentifier === total.attributeIdentifier,
    );
    return rowAttributeIndex === 0;
}

function processGrandTotal(rowAttributes: IBucketItem[], total: ITotal): ITotal {
    const isStillGrandTotal = isGrandTotal(rowAttributes, total);
    if (isStillGrandTotal) {
        return total;
    }
    return mapTotalToAttribute(total, rowAttributes[0]);
}

function mapTotalToAttribute(total: ITotal, attribute: IBucketItem): ITotal {
    return {
        ...total,
        attributeIdentifier: attribute.localIdentifier,
    };
}

function processSubtotal(
    total: ITotal,
    previousRowAttributes: IBucketItem[],
    rowAttributes: IBucketItem[],
): ITotal {
    const subtotalWithinAttribute = findSubtotalWithinAttribute(total, previousRowAttributes);
    const withinAttributeCurrentIndex = findAttributeIndex(subtotalWithinAttribute, rowAttributes);
    const isWithinAttributeInBucket = withinAttributeCurrentIndex >= 0;
    const isWithinAttributeLastInBucket = withinAttributeCurrentIndex === rowAttributes.length - 1;

    if (!isWithinAttributeInBucket || isWithinAttributeLastInBucket) {
        return null;
    }

    const currentSubtotalWithinAttribute = findSubtotalWithinAttribute(total, rowAttributes);
    const isWithinAttributeStillSame =
        !!currentSubtotalWithinAttribute &&
        subtotalWithinAttribute.localIdentifier === currentSubtotalWithinAttribute.localIdentifier;

    if (isWithinAttributeStillSame) {
        return total;
    }

    const subtotalNewAfmAttribute = findNextAttribute(subtotalWithinAttribute, rowAttributes);
    if (subtotalNewAfmAttribute === null) {
        return null;
    }

    return mapTotalToAttribute(total, subtotalNewAfmAttribute);
}

function findSubtotalWithinAttribute(total: ITotal, attributes: IBucketItem[]): IBucketItem {
    const totalIndex = findTotalAttributeIndex(total, attributes);
    return totalIndex > 0 ? attributes[totalIndex - 1] : null;
}

function findAttributeIndex(attribute: IBucketItem, attributes: IBucketItem[]): number {
    if (!attribute || !attributes) {
        return -1;
    }
    return attributes.findIndex(
        (bucketItem: IBucketItem) => bucketItem.localIdentifier === attribute.localIdentifier,
    );
}

function findNextAttribute(attribute: IBucketItem, attributes: IBucketItem[]): IBucketItem {
    const attributeIndex = findAttributeIndex(attribute, attributes);
    return attributeIndex === attributes.length ? null : attributes[attributeIndex + 1];
}

function findTotalAttributeIndex(total: ITotal, attributes: IBucketItem[]): number {
    if (!attributes) {
        return -1;
    }
    return attributes.findIndex(
        (attribute: IBucketItem) => attribute.localIdentifier === total.attributeIdentifier,
    );
}
