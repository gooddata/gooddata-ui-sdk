import * as React from 'react';
import { omit } from 'lodash';
import { Subtract } from 'utility-types';

import { BaseChart, ICommonChartProps, IChartProps } from './core/base/BaseChart';
import { convertBucketsToAFM, convertBucketsToMdObject } from '../helpers/conversion';

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

function generateDefaultDimensions(afm: AFM.IAfm): AFM.IDimension[] {
    if ((afm.attributes || []).length === 0) {
        return [
            {
                itemIdentifiers: []
            },
            {
                itemIdentifiers: ['measureGroup']
            }
        ];
    }

    return [
        {
            itemIdentifiers: (afm.attributes || []).map(a => a.localIdentifier)
        },
        {
            itemIdentifiers: ['measureGroup']
        }
    ];
}

export interface IBubbleChartBucketProps {
    xAxisMeasure: VisualizationObject.IMeasure;
    yAxisMeasure: VisualizationObject.IMeasure;
    size: VisualizationObject.IMeasure;
    viewBy?: VisualizationObject.IVisualizationAttribute;
    stackBy?: VisualizationObject.IVisualizationAttribute;
    filters?: VisualizationObject.VisualizationObjectFilter[];
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

const AfmBubbleChart = dataSourceProvider<ICommonChartProps>(CoreBubbleChart, generateDefaultDimensions, 'BubbleChart');

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

    const afmFromBuckets = convertBucketsToAFM(buckets, props.filters);

    return (
        <AfmBubbleChart
            afm={afmFromBuckets}
            type={'bubble'}
            {...newProps}
        />
    );
}
