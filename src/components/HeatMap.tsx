import * as React from 'react';
import { omit } from 'lodash';
import { Subtract } from 'utility-types';
import { VisualizationObject, AFM } from '@gooddata/typings';

import { HeatMap as AfmHeatMap } from './afm/HeatMap';
import { ICommonChartProps } from './core/base/BaseChart';
import { convertBucketsToAFM } from '../helpers/conversion';
import { generateStackedDimensions } from '../helpers/dimensions';
import { isStackedChart } from '../helpers/stacks';
import { generateDefaultDimensions } from './afm//afmHelper';

export interface IHeatMapBucketProps {
    measures: VisualizationObject.BucketItem[];
    trendBy?: VisualizationObject.IVisualizationAttribute;
    segmentBy?: VisualizationObject.IVisualizationAttribute;
    filters?: VisualizationObject.VisualizationObjectFilter[];
}

export interface IHeatMapProps extends ICommonChartProps, IHeatMapBucketProps {
    projectId: string;
}

type IHeatMapNonBucketProps = Subtract<IHeatMapProps, IHeatMapBucketProps>;

export interface IHeatMapProps extends ICommonChartProps {
    projectId: string;
}

function getStackingResultSpec(buckets: VisualizationObject.IBucket[]): AFM.IResultSpec {
    if (isStackedChart(buckets)) {
        return {
            dimensions: generateStackedDimensions(buckets)
        };
    }

    return {
        dimensions: generateDefaultDimensions(convertBucketsToAFM(buckets))
    };
}

export function HeatMap(props: IHeatMapProps): JSX.Element {
    const buckets: VisualizationObject.IBucket[] = [
        {
            localIdentifier: 'measures',
            items: props.measures || []
        },
        {
            localIdentifier: 'attributes',
            items: props.trendBy ? [props.trendBy] : []
        },
        {
            localIdentifier: 'stacks',
            items: props.segmentBy ? [props.segmentBy] : []
        }
    ];

    const newProps
        = omit<IHeatMapProps, IHeatMapNonBucketProps>(props, ['measures', 'trendBy', 'segmentBy', 'filters']);

    return (
        <AfmHeatMap
            {...newProps}
            projectId={props.projectId}
            afm={convertBucketsToAFM(buckets, props.filters)}
            resultSpec={getStackingResultSpec(buckets)}
        />
    );
}
