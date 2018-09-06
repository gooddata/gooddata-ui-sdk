import * as React from 'react';
import { VisualizationObject, AFM } from '@gooddata/typings';
import omit = require('lodash/omit');
import noop = require('lodash/noop');
import { Subtract } from 'utility-types';

import { PivotTable as CorePivotTable } from './core/PivotTable';
import { dataSourceProvider } from './afm/DataSourceProvider';
import { ICommonChartProps } from './core/base/BaseChart';
import { convertBucketsToAFM } from '../helpers/conversion';
import { getPivotTableDimensions } from '../helpers/dimensions';
import { getResultSpec } from '../helpers/resultSpec';

import {
    MEASURES,
    ROWS,
    COLUMNS
 } from '../constants/bucketNames';

export interface IPivotTableBucketProps {
    measures?: VisualizationObject.BucketItem[];
    rows?: VisualizationObject.IVisualizationAttribute[];
    columns?: VisualizationObject.IVisualizationAttribute[];
    totals?: VisualizationObject.IVisualizationTotal[];
    totalsEditAllowed?: boolean;
    filters?: VisualizationObject.VisualizationObjectFilter[];
    sortBy?: AFM.SortItem[];
}

export interface IPivotTableProps extends ICommonChartProps, IPivotTableBucketProps {
    projectId: string;
    totalsEditAllowed?: boolean;
    pageSize?: number;
}

const getBuckets = (props: IPivotTableBucketProps): VisualizationObject.IBucket[] => {
    const { measures, rows, columns, totals } = props;
    return [
        {
            localIdentifier: MEASURES,
            items: measures || []
        },
        {
            localIdentifier: ROWS,
            items: rows || [],
            totals: totals || []
        },
        {
            localIdentifier: COLUMNS,
            items: columns || []
        }
    ];
};

// noop is never called because resultSpec is always provided
const DataSourceProvider = dataSourceProvider(CorePivotTable, noop as any, 'PivotTable');

type IPivotTableNonBucketProps = Subtract<IPivotTableProps, IPivotTableBucketProps>;
/**
 * TODO: Update link to documentation [PivotTable](http://sdk.gooddata.com/gooddata-ui/docs/table_component.html)
 * is a component with bucket props measures, rows, columns, totals, sortBy, filters
 */
export class PivotTable extends React.Component<IPivotTableProps> {
    public render() {
        const { sortBy, filters } = this.props;

        const buckets: VisualizationObject.IBucket[] = getBuckets(this.props);

        const afm = convertBucketsToAFM(buckets, filters);
        const resultSpec = getResultSpec(buckets, sortBy, getPivotTableDimensions);

        const newProps
            = omit<IPivotTableProps, IPivotTableNonBucketProps>(this.props,
                ['measures', 'attributes', 'rows', 'columns', 'totals', 'filters', 'sortBy']);

        return (
            <DataSourceProvider
                {...newProps}
                afm={afm}
                resultSpec={resultSpec}
            />
        );
    }
}
