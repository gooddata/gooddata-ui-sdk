import * as React from 'react';
import { VisualizationObject, AFM } from '@gooddata/typings';

import { AGTable as CoreAGTable } from './core/AGTable';
import { Execute, IExecuteChildrenProps } from '../execution/Execute';
import { ErrorComponent } from './simple/ErrorComponent';
import { LoadingComponent } from './simple/LoadingComponent';
import { ICommonChartProps } from './core/base/BaseChart';
import { convertBucketsToAFM } from '../helpers/conversion';
import { getPivotTableDimensions } from '../helpers/dimensions';
import { getResultSpec } from '../helpers/resultSpec';

import {
    ATTRIBUTE,
    MEASURES,
    ROWS,
    COLUMNS
 } from '../constants/bucketNames';

export interface ITableBucketProps {
    measures?: VisualizationObject.BucketItem[];
    attributes?: VisualizationObject.IVisualizationAttribute[];
    rows?: VisualizationObject.IVisualizationAttribute[];
    columns?: VisualizationObject.IVisualizationAttribute[];
    totals?: VisualizationObject.IVisualizationTotal[];
    totalsEditAllowed?: boolean;
    filters?: VisualizationObject.VisualizationObjectFilter[];
    sortBy?: AFM.SortItem[];
}

export interface ITableProps extends ICommonChartProps, ITableBucketProps {
    projectId: string;
    totalsEditAllowed?: boolean;
}

/**
 * [Table](http://sdk.gooddata.com/gooddata-ui/docs/table_component.html)
 * is a component with bucket props measures, attributes, totals, filters
 */
export function AGTable(props: ITableProps): JSX.Element {

    const { projectId, measures, attributes, rows, columns, totals, sortBy, filters } = props;

    const buckets: VisualizationObject.IBucket[] = [
        {
            localIdentifier: MEASURES,
            items: measures || []
        },
        {
            localIdentifier: ATTRIBUTE,
            items: attributes || [],
            totals: totals || []
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

    // const newProps
    //     = omit<ITableProps, ITableNonBucketProps>(props, ['measures', 'attributes', 'totals', 'filters']);

    const afm = convertBucketsToAFM(buckets, filters);
    const resultSpec = getResultSpec(buckets, sortBy, getPivotTableDimensions);

    // TODO: create a pagable executor
    // TODO: convert execute to dataSource
    return (
        <Execute projectId={projectId} afm={afm} resultSpec={resultSpec} >{
        ({ error, isLoading, result }: IExecuteChildrenProps) => {
            // tslint:disable-next-line:no-console

            if (error) {
                return (<ErrorComponent
                    message="There was an error getting your execution"
                    description={JSON.stringify(error, null, '  ')}
                />);
            }
            if (isLoading) {
                return <LoadingComponent />;
            }

            return (<CoreAGTable
                executionResult={result}
            />);
        }}</Execute>
    );
}
