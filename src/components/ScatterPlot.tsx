// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { omit } from 'lodash';
import { Subtract } from 'utility-types';
import { VisualizationObject, AFM } from '@gooddata/typings';
import { ScatterPlot as AfmScatterPlot } from './afm/ScatterPlot';
import { ICommonChartProps } from './core/base/BaseChart';
import { convertBucketsToAFM, convertBucketsToMdObject } from '../helpers/conversion';
import { generateDefaultDimensionsForPointsCharts } from '../helpers/dimensions';
import { getResultSpec } from '../helpers/resultSpec';
import { MEASURES, SECONDARY_MEASURES, ATTRIBUTE } from '../constants/bucketNames';

export interface IScatterPlotBucketProps {
    xAxisMeasure?: VisualizationObject.IMeasure;
    yAxisMeasure?: VisualizationObject.IMeasure;
    attribute?: VisualizationObject.IVisualizationAttribute;
    filters?: VisualizationObject.VisualizationObjectFilter[];
    sortBy?: AFM.SortItem[]; // TODO would it be removed? if not dont forget to test
}

export interface IScatterPlotProps extends ICommonChartProps, IScatterPlotBucketProps {
    projectId: string;
}

type IScatterPlotNonBucketProps = Subtract<IScatterPlotProps, IScatterPlotBucketProps>;

const generateScatterDimensionsFromBuckets =
    (buckets: VisualizationObject.IBucket[]) => generateDefaultDimensionsForPointsCharts(convertBucketsToAFM(buckets));

/**
 * [ScatterPlot](http://sdk.gooddata.com/gooddata-ui/docs/scatter_plot_component.html)
 * is a component with bucket props xAxisMeasure, yAxisMeasure, attribute, filters
 */
export function ScatterPlot(props: IScatterPlotProps): JSX.Element {
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
            localIdentifier: ATTRIBUTE,
            items: props.attribute ? [props.attribute] : []
        }
    ];

    const newProps
        = omit<IScatterPlotProps, IScatterPlotNonBucketProps>(props,
            ['xAxisMeasure', 'yAxisMeasure', 'attribute', 'filters']);

    newProps.config = {
        ...newProps.config,
        mdObject: convertBucketsToMdObject(buckets, props.filters, 'local:scatter')
    };

    return (
        <AfmScatterPlot
            {...newProps}
            projectId={props.projectId}
            afm={convertBucketsToAFM(buckets, props.filters)}
            resultSpec={getResultSpec(buckets, props.sortBy, generateScatterDimensionsFromBuckets)}
        />
    );
}
