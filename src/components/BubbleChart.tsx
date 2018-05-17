import * as React from 'react';
import { omit } from 'lodash';
import { Subtract } from 'utility-types';

import { BaseChart, ICommonChartProps, IChartProps } from './core/base/BaseChart';
import { convertBucketsToAFM, convertBucketsToMdObject } from '../helpers/conversion';
import { getResultSpec } from '../helpers/resultSpec';

import { AFM, VisualizationObject } from '@gooddata/typings';
import {
    dataSourceProvider,
    IDataSourceProviderProps
} from './afm/DataSourceProvider';
import {
    MEASURES,
    SECONDARY_MEASURES,
    TERTIARY_MEASURES,
    STACK,
    VIEW
} from '../constants/bucketNames';

export {
    IDataSourceProviderProps
};

function generateBubbleDimensions(afm: AFM.IAfm): AFM.IDimension[] {
    return [
        {
            itemIdentifiers: (afm.attributes || []).map(a => a.localIdentifier)
        },
        {
            itemIdentifiers: ['measureGroup']
        }
    ];
}

const generateBubbleDimensionsFromBuckets =
    (buckets: VisualizationObject.IBucket[]) => generateBubbleDimensions(convertBucketsToAFM(buckets));

export interface IBubbleChartBucketProps {
    xAxisMeasure: VisualizationObject.IMeasure;
    yAxisMeasure: VisualizationObject.IMeasure;
    size: VisualizationObject.IMeasure;
    viewBy?: VisualizationObject.IVisualizationAttribute;
    stackBy?: VisualizationObject.IVisualizationAttribute;
    filters?: VisualizationObject.VisualizationObjectFilter[];
    sortBy?: AFM.SortItem[];
}

export interface IBubbleChartProps extends ICommonChartProps, IBubbleChartBucketProps {
    projectId: string;
}

type IBubbleChartNonBucketProps = Subtract<IBubbleChartProps, IBubbleChartBucketProps>;

const CoreBubbleChart = (props: IChartProps) => {
    return (
        <BaseChart
            type="bubble"
            {...props}
        />
    );
};

const AfmBubbleChart = dataSourceProvider<ICommonChartProps>(CoreBubbleChart, generateBubbleDimensions, 'BubbleChart');

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
        },
        {
            localIdentifier: STACK,
            items: props.stackBy ? [props.stackBy] : []
        }
    ];

    const newProps
        = omit<IBubbleChartNonBucketProps, IBubbleChartProps>(props,
        ['xAxisMeasure', 'yAxisMeasure', 'size', 'viewBy', 'stackBy', 'filters']);

    newProps.config = {
        ...newProps.config,
        mdObject: convertBucketsToMdObject(buckets, props.filters, 'local:bubble')
    };

    return (
        <AfmBubbleChart
            afm={convertBucketsToAFM(buckets, props.filters)}
            resultSpec={getResultSpec(buckets, props.sortBy, generateBubbleDimensionsFromBuckets)}
            {...newProps}
        />
    );
}
