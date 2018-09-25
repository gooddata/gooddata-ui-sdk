// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { omit } from 'lodash';
import { Subtract } from 'utility-types';

import { AFM, VisualizationObject } from '@gooddata/typings';

import { ICommonChartProps } from './core/base/BaseChart';
import { convertBucketsToAFM, convertBucketsToMdObject } from '../helpers/conversion';
import { getResultSpec } from '../helpers/resultSpec';
import { generateDefaultDimensionsForPointsCharts } from '../helpers/dimensions';
import { BubbleChart as AfmBubbleChart } from '../components/afm/BubbleChart';

import {
    IDataSourceProviderProps
} from './afm/DataSourceProvider';
import {
    MEASURES,
    SECONDARY_MEASURES,
    TERTIARY_MEASURES,
    VIEW
} from '../constants/bucketNames';

export {
    IDataSourceProviderProps
};

const generateBubbleDimensionsFromBuckets =
    (buckets: VisualizationObject.IBucket[]) => generateDefaultDimensionsForPointsCharts(convertBucketsToAFM(buckets));

export interface IBubbleChartBucketProps {
    xAxisMeasure?: VisualizationObject.IMeasure;
    yAxisMeasure?: VisualizationObject.IMeasure;
    size?: VisualizationObject.IMeasure;
    viewBy?: VisualizationObject.IVisualizationAttribute;
    filters?: VisualizationObject.VisualizationObjectFilter[];
    sortBy?: AFM.SortItem[];
}

export interface IBubbleChartProps extends ICommonChartProps, IBubbleChartBucketProps {
    projectId: string;
}

type IBubbleChartNonBucketProps = Subtract<IBubbleChartProps, IBubbleChartBucketProps>;

/**
 * [BubbleChart](http://sdk.gooddata.com/gdc-ui-sdk-doc/)
 */
export function BubbleChart(props: IBubbleChartProps): JSX.Element {
    const buckets: VisualizationObject.IBucket[] = [
        {
            localIdentifier: MEASURES,
            items: props.xAxisMeasure ? [props.xAxisMeasure] : []
        },
        {
            localIdentifier: SECONDARY_MEASURES,
            items: props.yAxisMeasure ? [props.yAxisMeasure] : []
        },
        {
            localIdentifier: TERTIARY_MEASURES,
            items: props.size ? [props.size] : []
        },
        {
            localIdentifier: VIEW,
            items: props.viewBy ? [props.viewBy] : []
        }
    ];

    const newProps
        = omit<IBubbleChartNonBucketProps, IBubbleChartProps>(props,
        ['xAxisMeasure', 'yAxisMeasure', 'size', 'viewBy', 'filters']);

    newProps.config = {
        ...newProps.config,
        mdObject: convertBucketsToMdObject(buckets, props.filters, 'local:bubble')
    };

    return (
        <AfmBubbleChart
            {...newProps}
            afm={convertBucketsToAFM(buckets, props.filters)}
            resultSpec={getResultSpec(buckets, props.sortBy, generateBubbleDimensionsFromBuckets)}
        />
    );
}
