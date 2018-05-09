import * as React from 'react';
import { omit, get } from 'lodash';
import { Subtract } from 'utility-types';
import { VisualizationObject, AFM } from '@gooddata/typings';

import { AreaChart as AfmAreaChart } from './afm/AreaChart';

import { ICommonChartProps } from './core/base/BaseChart';
import { convertBucketsToAFM } from '../helpers/conversion';
import { generateStackedDimensions } from '../helpers/dimensions';
import { isStackedChart } from '../helpers/stacks';

export interface IAreaChartBucketProps extends ICommonChartProps {
    measures: VisualizationObject.BucketItem[];
    viewBy?: VisualizationObject.IVisualizationAttribute[];
    stackBy?: VisualizationObject.IVisualizationAttribute[];
    filters?: VisualizationObject.VisualizationObjectFilter[];
}

export interface IAreaChartProps extends ICommonChartProps, IAreaChartBucketProps {
    projectId: string;
}

type IAreaChartNonBucketProps = Subtract<IAreaChartProps, IAreaChartBucketProps>;

export interface IAreaChartProps extends ICommonChartProps {
    projectId: string;
}

function generateDefaultDimensions(afm: AFM.IAfm): AFM.IDimension[] {
    return [
        {
            itemIdentifiers: ['measureGroup']
        },
        {
            itemIdentifiers: get(afm, 'attributes', []).map(a => a.localIdentifier)
        }
    ];
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

/**
 * [AreaChart](http://sdk.gooddata.com/gdc-ui-sdk-doc/docs/next/area_chart_component.html)
 * is a component with bucket props measures, viewBy, stacksBy, filters
 */
export function AreaChart(props: IAreaChartProps): JSX.Element {
    const buckets: VisualizationObject.IBucket[] = [
        {
            localIdentifier: 'measures',
            items: get(props, 'measures', [])
        },
        {
            localIdentifier: 'attributes',
            items: get(props, 'viewBy', [])
        },
        {
            localIdentifier: 'stacks',
            items: get(props, 'stackBy', [])
        }
    ];

    const newProps
        = omit<IAreaChartProps, IAreaChartNonBucketProps>(props, ['measures', 'viewBy', 'stackBy', 'filters']);

    return (
        <AfmAreaChart
            {...newProps}
            projectId={props.projectId}
            afm={convertBucketsToAFM(buckets, props.filters)}
            resultSpec={getStackingResultSpec(buckets)}
        />
    );
}
