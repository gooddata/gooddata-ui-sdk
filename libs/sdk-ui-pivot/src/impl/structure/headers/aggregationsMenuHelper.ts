// (C) 2019-2021 GoodData Corporation
import { attributeDescriptorLocalId, IAttributeDescriptor, ITotal, TotalType } from "@gooddata/sdk-model";

import { AVAILABLE_TOTALS } from "../../base/constants.js";
import findIndex from "lodash/findIndex.js";
import intersection from "lodash/intersection.js";
import isEqual from "lodash/isEqual.js";
import sortBy from "lodash/sortBy.js";
import uniq from "lodash/uniq.js";
import { IColumnTotal } from "./aggregationsMenuTypes.js";
import { IMenuAggregationClickConfig } from "../../privateTypes.js";

function getTotalsForMeasureAndType(totals: ITotal[], type: TotalType, measureLocalIdentifier: string) {
    return totals.filter(
        (total) => total.measureIdentifier === measureLocalIdentifier && total.type === type,
    );
}

function getAttributeIntersection(totals: ITotal[], type: TotalType, measureLocalIdentifiers: string[]) {
    const attributeGroups: string[][] = measureLocalIdentifiers.map((measure: string) => {
        const filteredTotals = getTotalsForMeasureAndType(totals, type, measure);
        return filteredTotals.map((total) => total.attributeIdentifier);
    });
    return intersection(...attributeGroups);
}

function getUniqueMeasures(totals: ITotal[], type: TotalType) {
    const totalsOfType = totals.filter((total) => total.type === type);
    return uniq(totalsOfType.map((total) => total.measureIdentifier));
}

function areMeasuresSame(measureLocalIdentifiers1: string[], measureLocalIdentifiers2: string[]) {
    const sameMeasureLocalIdentifiers: string[] = intersection(
        measureLocalIdentifiers1,
        measureLocalIdentifiers2,
    );
    return sameMeasureLocalIdentifiers.length === measureLocalIdentifiers2.length;
}

function getTotalsForAttributeHeader(totals: ITotal[], measureLocalIdentifiers: string[]): IColumnTotal[] {
    return AVAILABLE_TOTALS.reduce((columnTotals: IColumnTotal[], type: TotalType) => {
        const uniqueMeasureLocalIdentifiers = getUniqueMeasures(totals, type);
        if (areMeasuresSame(uniqueMeasureLocalIdentifiers, measureLocalIdentifiers)) {
            const attributeLocalIdentifiers = getAttributeIntersection(
                totals,
                type,
                uniqueMeasureLocalIdentifiers,
            );
            if (attributeLocalIdentifiers.length) {
                columnTotals.push({
                    type,
                    attributes: attributeLocalIdentifiers,
                });
            }
        }
        return columnTotals;
    }, []);
}

function getTotalsForMeasureHeader(totals: ITotal[], measureLocalIdentifier: string): IColumnTotal[] {
    return totals.reduce((turnedOnAttributes: IColumnTotal[], total: ITotal) => {
        if (total.measureIdentifier === measureLocalIdentifier) {
            const totalHeaderType = turnedOnAttributes.find((turned) => turned.type === total.type);
            if (totalHeaderType === undefined) {
                turnedOnAttributes.push({
                    type: total.type,
                    attributes: [total.attributeIdentifier],
                });
            } else {
                totalHeaderType.attributes.push(total.attributeIdentifier);
            }
        }
        return turnedOnAttributes;
    }, []);
}

function isTotalEnabledForAttribute(
    attributeLocalIdentifier: string[],
    columnAttributeLocalIdentifier: string[],
    totalType: TotalType,
    columnTotals: IColumnTotal[],
    rowTotals: IColumnTotal[],
): boolean {
    const columns = columnTotals.some((total: IColumnTotal) => {
        const find = total.attributes.some((attribute) => attributeLocalIdentifier.includes(attribute));
        return total.type === totalType && find;
    });
    const rows = rowTotals.some((total: IColumnTotal) => {
        const find = total.attributes.some((attribute) => columnAttributeLocalIdentifier.includes(attribute));
        return total.type === totalType && find;
    });

    return columns || rows;
}

function isTotalEnabledForSubMenuAttribute(
    attributeLocalIdentifier: string,
    totalType: TotalType,
    totals: IColumnTotal[],
): boolean {
    return totals.some((total: IColumnTotal) => {
        return total.type === totalType && total.attributes.includes(attributeLocalIdentifier);
    });
}

function includeTotals(totals: ITotal[], totalsChanged: ITotal[]) {
    const columnTotalsChangedUnique = totalsChanged.filter(
        (totalChanged) => !totals.some((total) => isEqual(total, totalChanged)),
    );

    return [...totals, ...columnTotalsChangedUnique];
}

function excludeTotals(totals: ITotal[], totalsChanged: ITotal[]): ITotal[] {
    return totals.filter((total) => !totalsChanged.find((totalChanged) => isEqual(totalChanged, total)));
}

export function getUpdatedColumnOrRowTotals(
    totals: ITotal[],
    menuAggregationClickConfig: IMenuAggregationClickConfig,
): ITotal[] {
    const { type, measureIdentifiers, attributeIdentifier, include } = menuAggregationClickConfig;

    const totalsChanged = measureIdentifiers.map((measureIdentifier) => ({
        type,
        measureIdentifier,
        attributeIdentifier,
    }));

    const updatedTotals = include
        ? includeTotals(totals, totalsChanged)
        : excludeTotals(totals, totalsChanged);

    return sortBy(updatedTotals, (total) =>
        findIndex(AVAILABLE_TOTALS, (rankedItem) => rankedItem === total.type),
    );
}

export function getAttributeDescriptorsLocalId(attributeDescriptors: IAttributeDescriptor[]): string[] {
    if (attributeDescriptors) {
        return attributeDescriptors.map(attributeDescriptorLocalId);
    }

    return [];
}

export default {
    getTotalsForAttributeHeader,
    getTotalsForMeasureHeader,
    isTotalEnabledForAttribute,
    isTotalEnabledForSubMenuAttribute,
    getUpdatedColumnOrRowTotals,
};
