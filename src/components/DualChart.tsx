// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { omit } from 'lodash';
import { Subtract } from 'utility-types';
import { VisualizationObject, AFM } from '@gooddata/typings';

import { DualChart as AfmDualChart } from './afm/DualChart';
import { ICommonChartProps } from './core/base/BaseChart';
import { convertBucketsToAFM, convertBucketsToMdObject } from '../helpers/conversion';
import { getResultSpec } from '../helpers/resultSpec';
import { MEASURES, SECONDARY_MEASURES, TREND } from '../constants/bucketNames';

export interface IDualChartBucketProps {
    leftAxisMeasure: VisualizationObject.BucketItem;
    rightAxisMeasure: VisualizationObject.BucketItem;
    trendBy?: VisualizationObject.IVisualizationAttribute;
    filters?: VisualizationObject.VisualizationObjectFilter[];
    sortBy?: AFM.SortItem[];
}

export interface IDualChartProps extends ICommonChartProps, IDualChartBucketProps {
    projectId: string;
}

type IDualChartNonBucketProps = Subtract<IDualChartProps, IDualChartBucketProps>;

export interface IDualChartProps extends ICommonChartProps {
    projectId: string;
}

/**
 * [DualChart](http://sdk.gooddata.com/gdc-ui-sdk-doc/docs/next/dual_chart_component.html)
 * is a component with bucket props measures, secondaryMeasures, trendBy, filters
 */
export function DualChart(props: IDualChartProps): JSX.Element {
    const buckets: VisualizationObject.IBucket[] = [
        {
            localIdentifier: MEASURES,
            items: props.leftAxisMeasure ? [props.leftAxisMeasure] : []
        },
        {
            localIdentifier: SECONDARY_MEASURES,
            items: props.rightAxisMeasure ? [props.rightAxisMeasure] : []
        },
        {
            localIdentifier: TREND,
            items: props.trendBy ? [props.trendBy] : []
        }
    ];

    const newProps = omit<IDualChartProps, IDualChartNonBucketProps>(props,
        ['leftAxisMeasure', 'rightAxisMeasure', 'trendBy', 'filters']);

    newProps.config = {
        ...newProps.config,
        mdObject: convertBucketsToMdObject(buckets, props.filters, 'local:combo')
    };

    return (
        <AfmDualChart
            {...newProps}
            projectId={props.projectId}
            afm={convertBucketsToAFM(buckets, props.filters)}
            resultSpec={getResultSpec(buckets, props.sortBy)}
        />
    );
}
