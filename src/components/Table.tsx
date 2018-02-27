import * as React from 'react';
import { omit } from 'lodash';
import { Subtract } from 'utility-types';
import { VisualizationObject } from '@gooddata/typings';

import { Table as AfmTable } from './afm/Table';
import { ICommonChartProps } from './core/base/BaseChart';
import { convertBucketsToAFM } from '../helpers/conversion';
import { getTableDimensions } from '../helpers/dimensions';

export interface ITableBucketProps {
    measures: VisualizationObject.BucketItem[];
    attributes?: VisualizationObject.IVisualizationAttribute[];
    totals?: VisualizationObject.IVisualizationTotal[];
    totalsEditAllowed?: boolean;
    filters?: VisualizationObject.VisualizationObjectFilter[];
}

export interface ITableProps extends ICommonChartProps, ITableBucketProps {
    projectId: string;
    totalsEditAllowed?: boolean;
}

type ITableNonBucketProps = Subtract<ITableProps, ITableBucketProps>;

export function Table(props: ITableProps): JSX.Element {
    const buckets: VisualizationObject.IBucket[] = [
        {
            localIdentifier: 'measures',
            items: props.measures || []
        },
        {
            localIdentifier: 'attributes',
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
            resultSpec={{ dimensions: getTableDimensions(buckets) }}
        />
    );
}
