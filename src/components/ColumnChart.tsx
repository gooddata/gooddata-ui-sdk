// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { omit } from 'lodash';
import { Subtract } from 'utility-types';
import { VisualizationInput, VisualizationObject } from '@gooddata/typings';

import { ColumnChart as AfmColumnChart } from './afm/ColumnChart';
import { ICommonChartProps } from './core/base/BaseChart';
import { convertBucketsToAFM } from '../helpers/conversion';
import { getStackingResultSpec } from '../helpers/resultSpec';
import { MEASURES, ATTRIBUTE, STACK } from '../constants/bucketNames';
import { getViewByTwoAttributes } from '../helpers/optionalStacking/common';

export interface IColumnChartBucketProps {
    measures: VisualizationInput.AttributeOrMeasure[];
    viewBy?: VisualizationInput.IAttribute | VisualizationInput.IAttribute[];
    stackBy?: VisualizationInput.IAttribute;
    filters?: VisualizationInput.IFilter[];
    sortBy?: VisualizationInput.ISort[];
}

export interface IColumnChartProps extends ICommonChartProps, IColumnChartBucketProps {
    projectId: string;
}

type IColumnChartNonBucketProps = Subtract<IColumnChartProps, IColumnChartBucketProps>;

/**
 * [ColumnChart](http://sdk.gooddata.com/gooddata-ui/docs/column_chart_component.html)
 * is a component with bucket props measures, viewBy, stackBy, filters
 */
export function ColumnChart(props: IColumnChartProps): JSX.Element {
    const buckets: VisualizationObject.IBucket[] = [
        {
            localIdentifier: MEASURES,
            items: props.measures || []
        },
        {
            localIdentifier: ATTRIBUTE,
            items: getViewByTwoAttributes(props.viewBy) // could be one or two attributes
        },
        {
            localIdentifier: STACK,
            items: props.stackBy ? [props.stackBy] : []
        }
    ];

    const newProps
        = omit<IColumnChartProps, IColumnChartNonBucketProps>(props, ['measures', 'viewBy', 'stackBy', 'filters']);

    return (
        <AfmColumnChart
            {...newProps}
            projectId={props.projectId}
            afm={convertBucketsToAFM(buckets, props.filters)}
            resultSpec={getStackingResultSpec(buckets, props.sortBy)}
        />
    );
}
