// (C) 2019 GoodData Corporation
import { AFM, Execution } from '@gooddata/typings';
import * as invariant from 'invariant';
import uniq = require('lodash/uniq');

import { FIELD_TYPE_ATTRIBUTE, FIELD_TYPE_MEASURE } from '../../../helpers/agGrid';
import { AVAILABLE_TOTALS } from '../../visualizations/table/totals/utils';
import { IColumnTotal } from './AggregationsMenu';

const getTotalTypesAppliedOnMeasures = (
    totals: AFM.ITotalItem[],
    measureLocalIdentifiers: string[]
): AFM.TotalType[] => {
    return AVAILABLE_TOTALS.filter((type) => {
        const totalsOfType = totals.filter((total: AFM.ITotalItem) => total.type === type);
        const totalsMeasureIdentifiers = totalsOfType.map((total: AFM.ITotalItem) => total.measureIdentifier);
        return measureLocalIdentifiers.every((measureIdentfier: string) => {
            return totalsMeasureIdentifiers.includes(measureIdentfier);
        });
    });
};

function getTotalsForAttributeHeader(
    totals: AFM.ITotalItem[],
    measureLocalIdentifiers: string[]
): IColumnTotal[] {
    const totalTypesAppliedOnAllMeasures = getTotalTypesAppliedOnMeasures(totals, measureLocalIdentifiers);

    return totalTypesAppliedOnAllMeasures.map((totalType: AFM.TotalType) => {
        const attributeIdentifiers = totals
            .filter((total: AFM.ITotalItem) => total.type === totalType)
            .map((total: AFM.ITotalItem) => total.attributeIdentifier);

        return { type: totalType, attributes: uniq(attributeIdentifiers) };
    });
}

function getTotalsForMeasureHeader(
    totals: AFM.ITotalItem[],
    measureLocalIdentifier: string
): IColumnTotal[] {
    return totals.reduce((turnedOnAttributes: IColumnTotal[], total: AFM.ITotalItem) => {
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
    isTotalEnabledForAttribute,
    getTotalTypesAppliedOnMeasures
};
