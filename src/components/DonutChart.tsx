// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { omit } from 'lodash';
import { Subtract } from 'utility-types';
import { VisualizationObject } from '@gooddata/typings';

import { DonutChart as AfmDonutChart } from './afm/DonutChart';
import { ICommonChartProps } from './core/base/BaseChart';
import { convertBucketsToAFM } from '../helpers/conversion';
import { MEASURES, VIEW } from '../constants/bucketNames';

export interface IDonutChartBucketProps {
    measures: VisualizationObject.BucketItem[];
    viewBy?: VisualizationObject.IVisualizationAttribute;
    filters?: VisualizationObject.VisualizationObjectFilter[];
}

export interface IDonutChartProps extends ICommonChartProps, IDonutChartBucketProps {
    projectId: string;
}

type IDonutChartNonBucketProps = Subtract<IDonutChartProps, IDonutChartBucketProps>;

/**
 * [DonutChart](http://sdk.gooddata.com/gooddata-ui/docs/donut_chart_component.html)
 * is a component with bucket props measures, viewBy, filters
 */
export function DonutChart(props: IDonutChartProps): JSX.Element {
    const buckets: VisualizationObject.IBucket[] = [
        {
            localIdentifier: MEASURES,
            items: props.measures || []
        },
        {
            localIdentifier: VIEW,
            items: props.viewBy ? [props.viewBy] : []
        }
    ];

    const newProps
        = omit<IDonutChartProps, IDonutChartNonBucketProps>(props, ['measures', 'viewBy', 'filters']);

    return (
        <AfmDonutChart
            {...newProps}
            projectId={props.projectId}
            afm={convertBucketsToAFM(buckets, props.filters)}
        />
    );
}
