// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { omit } from 'lodash';
import { Subtract } from 'utility-types';
import { VisualizationObject, AFM } from '@gooddata/typings';

import { Heatmap as AfmHeatmap } from './afm/Heatmap';
import { ICommonChartProps } from './core/base/BaseChart';
import { convertBucketsToAFM } from '../helpers/conversion';
import { getStackingResultSpec } from '../helpers/resultSpec';
import { MEASURES, ATTRIBUTE, STACK } from '../constants/bucketNames';

export interface IHeatmapBucketProps {
    measure: VisualizationObject.BucketItem;
    trendBy?: VisualizationObject.IVisualizationAttribute;
    segmentBy?: VisualizationObject.IVisualizationAttribute;
    filters?: VisualizationObject.VisualizationObjectFilter[];
    sortBy?: AFM.SortItem[];
}

export interface IHeatmapProps extends ICommonChartProps, IHeatmapBucketProps {
    projectId: string;
}

type IHeatmapNonBucketProps = Subtract<IHeatmapProps, IHeatmapBucketProps>;

export interface IHeatmapProps extends ICommonChartProps {
    projectId: string;
}

export function Heatmap(props: IHeatmapProps): JSX.Element {
    const buckets: VisualizationObject.IBucket[] = [
        {
            localIdentifier: MEASURES,
            items: [props.measure] || []
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
        = omit<IHeatmapProps, IHeatmapNonBucketProps>(props, ['measure', 'trendBy', 'segmentBy', 'filters']);

    return (
        <AfmHeatmap
            {...newProps}
            projectId={props.projectId}
            afm={convertBucketsToAFM(buckets, props.filters)}
            resultSpec={getStackingResultSpec(buckets, props.sortBy)}
        />
    );
}
