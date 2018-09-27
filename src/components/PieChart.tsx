// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { omit } from 'lodash';
import { Subtract } from 'utility-types';
import { VisualizationObject, AFM } from '@gooddata/typings';

import { PieChart as AfmPieChart } from './afm/PieChart';
import { ICommonChartProps } from './core/base/BaseChart';
import { convertBucketsToAFM } from '../helpers/conversion';
import { getResultSpec } from '../helpers/resultSpec';
import { generateDefaultDimensionsForRoundChart } from '../helpers/dimensions';
import { MEASURES, VIEW } from '../constants/bucketNames';

export interface IPieChartBucketProps {
    measures: VisualizationObject.BucketItem[];
    viewBy?: VisualizationObject.IVisualizationAttribute;
    filters?: VisualizationObject.VisualizationObjectFilter[];
    sortBy?: AFM.SortItem[];
}

export interface IPieChartProps extends ICommonChartProps, IPieChartBucketProps {
    projectId: string;
}

type IPieChartNonBucketProps = Subtract<IPieChartProps, IPieChartBucketProps>;

const generatePieDimensionsFromBuckets =
    (buckets: VisualizationObject.IBucket[]) => generateDefaultDimensionsForRoundChart(convertBucketsToAFM(buckets));

/**
 * [PieChart](http://sdk.gooddata.com/gooddata-ui/docs/pie_chart_component.html)
 * is a component with bucket props measures, viewBy, filters
 */
export function PieChart(props: IPieChartProps): JSX.Element {
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
        = omit<IPieChartProps, IPieChartNonBucketProps>(props, ['measures', 'viewBy', 'filters']);

    return (
        <AfmPieChart
            {...newProps}
            projectId={props.projectId}
            afm={convertBucketsToAFM(buckets, props.filters)}
            resultSpec={getResultSpec(buckets, props.sortBy, generatePieDimensionsFromBuckets)}
        />
    );
}
