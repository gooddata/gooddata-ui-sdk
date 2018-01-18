import * as React from 'react';
import { AFM } from '@gooddata/typings';
import { find, findIndex } from 'lodash';
import {
    dataSourceProvider,
    IDataSourceProviderProps
} from './DataSourceProvider';
import { ITotalItem as IIndexedTotalItem} from '../../interfaces/Totals';

export {
    IDataSourceProviderProps
};

import { SortableTable } from '../core/SortableTable';

function generateDefaultDimensions(afm: AFM.IAfm): AFM.IDimension[] {
    return [
        {
            itemIdentifiers: (afm.attributes || []).map(a => a.localIdentifier)
        },
        {
            itemIdentifiers: ['measureGroup']
        }
    ];
}

function getIndexedTotals(afm: AFM.IAfm, resultSpec: AFM.IResultSpec): IIndexedTotalItem[] {
    if (resultSpec && resultSpec.dimensions && resultSpec.dimensions[0] && resultSpec.dimensions[0].totals) {
        const resultSpectGrandTotals: AFM.ITotalItem[] = resultSpec.dimensions[0].totals;

        const indexedTotals: IIndexedTotalItem[] = [];

        resultSpectGrandTotals.forEach((resultSpectGrandTotal: AFM.ITotalItem) => {
            const measureIndex = findIndex(afm.measures, (measure: AFM.IMeasure) => {
                return (measure.localIdentifier === resultSpectGrandTotal.measureIdentifier);
            });

            if (measureIndex === -1) {
                return;
            }

            const indexedTotal = find(indexedTotals, total => (total.type === resultSpectGrandTotal.type));
            if (indexedTotal) {
                indexedTotal.outputMeasureIndexes.push(measureIndex);
            } else {
                indexedTotals.push ({
                    type: resultSpectGrandTotal.type,
                    outputMeasureIndexes: [measureIndex]
                });
            }
        });

        return indexedTotals;
    }
}

function totalsProvider(Component: React.ComponentClass) {
    return (props: IDataSourceProviderProps) => {
        const newProps = {
            ...props,
            totals: getIndexedTotals(props.afm, props.resultSpec)
        };
        return (
            <Component {...newProps}/>
        );
    };
}

const TableWithDataSource = dataSourceProvider(SortableTable, generateDefaultDimensions);

export const Table = totalsProvider(TableWithDataSource);
