import * as React from 'react';
import { omit } from 'lodash';
import { Subtract } from 'utility-types';
import { VisualizationObject, AFM } from '@gooddata/typings';
import { ScatterPlot as AfmScatterPlot } from './afm/ScatterPlot';
import { ICommonChartProps } from './core/base/BaseChart';
import { convertBucketsToAFM, convertBucketsToMdObject } from '../helpers/conversion';

export interface IScatterPlotBucketProps {
    xAxisMeasure: VisualizationObject.IMeasure;
    yAxisMeasure?: VisualizationObject.IMeasure;
    attribute?: VisualizationObject.IVisualizationAttribute;
    filters?: VisualizationObject.VisualizationObjectFilter[];
}

export interface IScatterPlotProps extends ICommonChartProps, IScatterPlotBucketProps {
    projectId: string;
}

type IScatterPlotNonBucketProps = Subtract<IScatterPlotProps, IScatterPlotBucketProps>;

function generateDefaultDimensions(afm: AFM.IAfm): AFM.IDimension[] {
    return [
        {
            itemIdentifiers: (afm.attributes || []).map(a => a.localIdentifier)
        },
        {
            itemIdentifiers: ['measureGroup']
        }
    ];
}

function getResultSpec(buckets: VisualizationObject.IBucket[]): AFM.IResultSpec {
    return {
        dimensions: generateDefaultDimensions(convertBucketsToAFM(buckets))
    };
}

/**
 * [ScatterPlot](http://sdk.gooddata.com/gdc-ui-sdk-doc/docs/next/line_chart_component.html) TODO: change
 * is a component with bucket props measures, trendBy, segmentBy, filters
 */
export function ScatterPlot(props: IScatterPlotProps): JSX.Element {
    const buckets: VisualizationObject.IBucket[] = [
        {
            localIdentifier: 'measures',
            items: props.xAxisMeasure ? [props.xAxisMeasure] : []
        },
        {
            localIdentifier: 'secondary_measures',
            items: props.yAxisMeasure ? [props.yAxisMeasure] : []
        },
        {
            localIdentifier: 'attribute',
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
            resultSpec={getResultSpec(buckets)}
        />
    );
}
