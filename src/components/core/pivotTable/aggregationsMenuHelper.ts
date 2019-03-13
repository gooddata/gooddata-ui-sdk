// (C) 2019 GoodData Corporation
import { AFM, Execution } from '@gooddata/typings';
import * as invariant from 'invariant';
import uniq = require('lodash/uniq');

import { FIELD_TYPE_ATTRIBUTE, FIELD_TYPE_MEASURE } from '../../../helpers/agGrid';
import { AVAILABLE_TOTALS } from '../../visualizations/table/totals/utils';
import { IColumnTotal } from './AggregationsMenu';

const getTotalTypesAppliedOnAllMeasures = (
    columnTotals: AFM.ITotalItem[],
    measureLocalIdentifiers: string[]
): AFM.TotalType[] => AVAILABLE_TOTALS.filter((type) => {
    const columnTotalsLength = columnTotals.filter((total: AFM.ITotalItem) => total.type === type).length;
    return columnTotalsLength === measureLocalIdentifiers.length;
});

function getTotalsForAttributeHeader(
    columnTotals: AFM.ITotalItem[],
    measureLocalIdentifiers: string[]
): IColumnTotal[] {
    const totalTypesAppliedOnAllMeasures = getTotalTypesAppliedOnAllMeasures(columnTotals, measureLocalIdentifiers);

    return totalTypesAppliedOnAllMeasures.map((totalType: AFM.TotalType) => {
        const attributeIdentifiers = columnTotals
            .filter((total: AFM.ITotalItem) => total.type === totalType)
            .map((total: AFM.ITotalItem) => total.attributeIdentifier);

        return { type: totalType, attributes: uniq(attributeIdentifiers) };
    });
}

function getTotalsForMeasureHeader(
    columnTotals: AFM.ITotalItem[],
    measureLocalIdentifier: string
): IColumnTotal[] {
    return columnTotals.reduce((turnedOnAttributes: IColumnTotal[], total: AFM.ITotalItem) => {
        if (total.measureIdentifier === measureLocalIdentifier) {
            const totalHeaderType = turnedOnAttributes.find(turned => turned.type === total.type);
            if (totalHeaderType === undefined) {
                turnedOnAttributes.push({
                    type: total.type,
                    attributes: [total.attributeIdentifier]
                });
            } else {
                totalHeaderType.attributes.push(total.attributeIdentifier);
            }
        }
        return turnedOnAttributes;
    }, []);
}

function getHeaderMeasureLocalIdentifiers(
    measureGroupHeaderItems: Execution.IMeasureHeaderItem[],
    lastFieldType: string,
    lastFieldId: string | number
): string[] {
    if (lastFieldType === FIELD_TYPE_MEASURE) {
        if (measureGroupHeaderItems.length === 0 || !measureGroupHeaderItems[lastFieldId]) {
            invariant(false, `Measure header with index ${lastFieldId} was not found`);
        }
        const { measureHeaderItem: { localIdentifier } } = measureGroupHeaderItems[lastFieldId];
        return [localIdentifier];
    } else if (lastFieldType === FIELD_TYPE_ATTRIBUTE) {
        return measureGroupHeaderItems.map(item => item.measureHeaderItem.localIdentifier);
    }
    invariant(false, `Unknown field type '${lastFieldType}' provided`);
}

function isTotalEnabledForAttribute(
    attributeLocalIdentifier: string,
    totalType: AFM.TotalType,
    columnTotals: IColumnTotal[]
): boolean {
    return columnTotals.some((total: IColumnTotal) => {
        return total.type === totalType && total.attributes.includes(attributeLocalIdentifier);
    });
}

export default {
    getTotalsForAttributeHeader,
    getTotalsForMeasureHeader,
    getHeaderMeasureLocalIdentifiers,
    isTotalEnabledForAttribute
};
