// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { omit } from 'lodash';
import { Subtract } from 'utility-types';
import { VisualizationObject, AFM } from '@gooddata/typings';

import { AreaChart as AfmAreaChart } from './afm/AreaChart';

import { ICommonChartProps } from './core/base/BaseChart';
import { convertBucketsToAFM } from '../helpers/conversion';
import { getStackingResultSpec } from '../helpers/resultSpec';
import { MEASURES, ATTRIBUTE, STACK } from '../constants/bucketNames';
import { verifyBuckets, getBucketsProps, getConfigProps } from '../helpers/optionalStacking/areaChart';

export interface IAreaChartBucketProps {
    measures: VisualizationObject.BucketItem[];
    viewBy?: VisualizationObject.IVisualizationAttribute | VisualizationObject.IVisualizationAttribute[];
    stackBy?: VisualizationObject.IVisualizationAttribute;
    filters?: VisualizationObject.VisualizationObjectFilter[];
    sortBy?: AFM.SortItem[];
}

export interface IAreaChartProps extends ICommonChartProps, IAreaChartBucketProps {
    projectId: string;
}

type IAreaChartNonBucketProps = Subtract<IAreaChartProps, IAreaChartBucketProps>;

/**
 * [AreaChart](http://sdk.gooddata.com/gooddata-ui/docs/area_chart_component.html)
 * is a component with bucket props measures, viewBy, stacksBy, filters
 */
export function AreaChart(props: IAreaChartProps): JSX.Element {
    verifyBuckets(props);

    const { measures, viewBy, stackBy } = getBucketsProps(props);
    const configProp = getConfigProps(props);

    const buckets: VisualizationObject.IBucket[] = [{
        localIdentifier: MEASURES,
        items: measures
    }, {
        localIdentifier: ATTRIBUTE,
        items: viewBy
    }, {
        localIdentifier: STACK,
        items: stackBy
    }];

    const newProps
        = omit<IAreaChartProps, IAreaChartNonBucketProps>(props, ['measures', 'viewBy', 'stackBy', 'filters']);
    newProps.config = {
        ...newProps.config,
        ...configProp
    };

    return (
        <AfmAreaChart
            {...newProps}
            projectId={props.projectId}
            afm={convertBucketsToAFM(buckets, props.filters)}
            resultSpec={getStackingResultSpec(buckets, props.sortBy)}
        />
    );
}
