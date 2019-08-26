// (C) 2007-2018 GoodData Corporation
import { AFM, VisualizationObject } from "@gooddata/typings";
import find = require("lodash/find");
import findIndex = require("lodash/findIndex");
import isEmpty = require("lodash/isEmpty");
import get = require("lodash/get");

import { IIndexedTotalItem } from "../interfaces/Totals";

function convertResultSpecTotals(resultSpec: AFM.IResultSpec): VisualizationObject.IVisualizationTotal[] {
    return get(resultSpec, "dimensions[0].totals", []);
}

function getMeasureIndex(measureIdentifier: string, afm: AFM.IAfm): number {
    const afmMeasures = get(afm, "measures", []);
    return findIndex(afmMeasures, (measure: AFM.IMeasure) => {
        return measure.localIdentifier === measureIdentifier;
    });
}

export function convertToIndexedTotals(
    totals: VisualizationObject.IVisualizationTotal[],
    afm: AFM.IAfm,
    resultSpec: AFM.IResultSpec,
): IIndexedTotalItem[] {
    const grandTotals = !isEmpty(totals) ? totals : convertResultSpecTotals(resultSpec);

    if (isEmpty(grandTotals)) {
        return [];
    }

    const indexedTotals: IIndexedTotalItem[] = [];
    grandTotals.forEach((grandTotal: VisualizationObject.IVisualizationTotal) => {
        const measureIndex = getMeasureIndex(grandTotal.measureIdentifier, afm);

        if (measureIndex === -1) {
            return;
        }

        const indexedTotal = find(indexedTotals, total => total.type === grandTotal.type);
        if (indexedTotal) {
            indexedTotal.outputMeasureIndexes.push(measureIndex);
        } else {
            const aliasProp = grandTotal.alias ? { alias: grandTotal.alias } : {};

            indexedTotals.push({
                type: grandTotal.type,
                outputMeasureIndexes: [measureIndex],
                ...aliasProp,
            });
        }
    });

    return indexedTotals;
}

export function convertToTotals(
    indexedTotals: IIndexedTotalItem[],
    afm: AFM.IAfm,
): VisualizationObject.IVisualizationTotal[] {
    if (isEmpty(indexedTotals)) {
        return [];
    }

    const grandTotals: VisualizationObject.IVisualizationTotal[] = [];

    indexedTotals.forEach(indexedTotal => {
        indexedTotal.outputMeasureIndexes.forEach(measureIndex => {
            const measure = afm.measures[measureIndex];
            const attribute = afm.attributes[0];

            const aliasProp = indexedTotal.alias ? { alias: indexedTotal.alias } : {};

            grandTotals.push({
                type: indexedTotal.type,
                measureIdentifier: measure.localIdentifier,
                attributeIdentifier: attribute.localIdentifier,
                ...aliasProp,
            });
        });
    });

    return grandTotals;
}
