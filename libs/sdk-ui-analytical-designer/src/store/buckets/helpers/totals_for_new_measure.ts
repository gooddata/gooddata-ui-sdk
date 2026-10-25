// (C) 2026 GoodData Corporation

import { isEqual, uniq, uniqWith } from "lodash-es";

import { type ITotal, type TotalType } from "@gooddata/sdk-model";

/**
 * When a measure is dropped into a bucket, it inherits every total that is currently enabled for
 * ALL the other measures — the user's intent being "this total applies to the whole table", not to
 * one measure. The state read that produces `previousMeasureLocalIdentifiers` is the caller's: the
 * computation is the helper, the state access is not.
 */

interface ITotalWithoutMeasureReference {
    type: TotalType;
    attributeIdentifier: string;
}

/**
 * @param newMeasureLocalIdentifier - the measure that was just dropped into the bucket
 * @param totals - the totals currently stored on the bucket
 * @param previousMeasureLocalIdentifiers - every measure in the buckets EXCEPT the new one
 * @returns the totals to append for the new measure (empty when there is nothing to inherit)
 */
export function getTotalsForMeasureEnabledOnAllOtherMeasures(
    newMeasureLocalIdentifier: string,
    totals: ITotal[],
    previousMeasureLocalIdentifiers: string[],
): ITotal[] {
    if (previousMeasureLocalIdentifiers.length === 0) {
        return [];
    }

    return getDistinctTotalsWithoutMeasureReference(totals)
        .filter((total) => isTotalEnabledForAllMeasures(total, totals, previousMeasureLocalIdentifiers))
        .map((total) => augmentWithMeasureReference(total, newMeasureLocalIdentifier));
}

function getDistinctTotalsWithoutMeasureReference(totals: ITotal[]): ITotalWithoutMeasureReference[] {
    const totalsWithoutMeasure = totals.map(removeTotalMeasureReference);
    return uniqWith(totalsWithoutMeasure, isEqual);
}

function removeTotalMeasureReference(total: ITotal): ITotalWithoutMeasureReference {
    return {
        type: total.type,
        attributeIdentifier: total.attributeIdentifier,
    };
}

function isTotalEnabledForAllMeasures(
    testedTotal: ITotalWithoutMeasureReference,
    totals: ITotal[],
    previousMeasureLocalIdentifiers: string[],
): boolean {
    const matchingTotals = totals.filter((total: ITotal) => isMatchingTotal(total, testedTotal));
    const measuresWithMatchingTotal = matchingTotals.map((total: ITotal) => total.measureIdentifier);
    const distinctMeasuresWithMatchingTotal = uniq(measuresWithMatchingTotal);

    return (
        filterValidMeasures(distinctMeasuresWithMatchingTotal, previousMeasureLocalIdentifiers).length ===
        previousMeasureLocalIdentifiers.length
    );
}

function isMatchingTotal(testedTotal: ITotal, template: ITotalWithoutMeasureReference): boolean {
    return (
        testedTotal.attributeIdentifier === template.attributeIdentifier && testedTotal.type === template.type
    );
}

function filterValidMeasures(
    testedMeasureIdentifiers: string[],
    validMeasureIdentifiers: string[],
): string[] {
    return testedMeasureIdentifiers.filter((measureLocalIdentifier: string) =>
        validMeasureIdentifiers.includes(measureLocalIdentifier),
    );
}

function augmentWithMeasureReference(
    total: ITotalWithoutMeasureReference,
    measureLocalIdentifier: string,
): ITotal {
    return {
        ...total,
        measureIdentifier: measureLocalIdentifier,
    };
}
