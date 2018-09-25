// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { omit } from 'lodash';
import { Subtract } from 'utility-types';
import { VisualizationObject, AFM } from '@gooddata/typings';

import { Table as AfmTable } from './afm/Table';
import { ICommonChartProps } from './core/base/BaseChart';
import { convertBucketsToAFM } from '../helpers/conversion';
import { getTableDimensions } from '../helpers/dimensions';
import { getResultSpec } from '../helpers/resultSpec';
import { MEASURES, ATTRIBUTE } from '../constants/bucketNames';

export interface ITableBucketProps {
    measures?: VisualizationObject.BucketItem[];
    attributes?: VisualizationObject.IVisualizationAttribute[];
    totals?: VisualizationObject.IVisualizationTotal[];
    totalsEditAllowed?: boolean;
    filters?: VisualizationObject.VisualizationObjectFilter[];
    sortBy?: AFM.SortItem[];
}

export interface ITableProps extends ICommonChartProps, ITableBucketProps {
    projectId: string;
    totalsEditAllowed?: boolean;
}

type ITableNonBucketProps = Subtract<ITableProps, ITableBucketProps>;

/**
 * [Table](http://sdk.gooddata.com/gooddata-ui/docs/table_component.html)
 * is a component with bucket props measures, attributes, totals, filters
 */
export function Table(props: ITableProps): JSX.Element {
    const buckets: VisualizationObject.IBucket[] = [
        {
            localIdentifier: MEASURES,
            items: props.measures || []
        },
        {
            localIdentifier: ATTRIBUTE,
            items: props.attributes || [],
            totals: props.totals || []
        }
    ];

    const newProps
        = omit<ITableProps, ITableNonBucketProps>(props, ['measures', 'attributes', 'totals', 'filters']);

    return (
        <AfmTable
            {...newProps}
            afm={convertBucketsToAFM(buckets, props.filters)}
            resultSpec={getResultSpec(buckets, props.sortBy, getTableDimensions)}
        />
    );
}
