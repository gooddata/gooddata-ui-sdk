// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { omit } from 'lodash';
import { Subtract } from 'utility-types';
import { VisualizationObject, VisualizationInput } from '@gooddata/typings';

import { LineChart as AfmLineChart } from './afm/LineChart';
import { ICommonChartProps } from './core/base/BaseChart';
import { convertBucketsToAFM } from '../helpers/conversion';
import { getStackingResultSpec } from '../helpers/resultSpec';
import { MEASURES, ATTRIBUTE, STACK } from '../constants/bucketNames';

export interface ILineChartBucketProps {
    measures: VisualizationInput.AttributeOrMeasure[];
    trendBy?: VisualizationInput.IAttribute;
    segmentBy?: VisualizationInput.IAttribute;
    filters?: VisualizationInput.IFilter[];
    sortBy?: VisualizationInput.ISort[];
}

export interface ILineChartProps extends ICommonChartProps, ILineChartBucketProps {
    projectId: string;
}

type ILineChartNonBucketProps = Subtract<ILineChartProps, ILineChartBucketProps>;

/**
 * [LineChart](http://sdk.gooddata.com/gooddata-ui/docs/line_chart_component.html)
 * is a component with bucket props measures, trendBy, segmentBy, filters
 */
export function LineChart(props: ILineChartProps): JSX.Element {
    const buckets: VisualizationObject.IBucket[] = [
        {
            localIdentifier: MEASURES,
            items: props.measures || []
        },
        {
            localIdentifier: ATTRIBUTE,
            items: props.trendBy ? [props.trendBy] : []
        },
        {
            localIdentifier: STACK,
            items: props.segmentBy ? [props.segmentBy] : []
        }
    ];

    const newProps
        = omit<ILineChartProps, ILineChartNonBucketProps>(props, ['measures', 'trendBy', 'segmentBy', 'filters']);

    return (
        <AfmLineChart
            {...newProps}
            projectId={props.projectId}
            afm={convertBucketsToAFM(buckets, props.filters)}
            resultSpec={getStackingResultSpec(buckets, props.sortBy)}
        />
    );
}
