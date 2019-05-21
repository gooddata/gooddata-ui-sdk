// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import omit = require("lodash/omit");

import { VisualizationInput, VisualizationObject } from "@gooddata/typings";

import { Subtract } from "../typings/subtract";
import { ICommonChartProps } from "./core/base/BaseChart";
import { convertBucketsToAFM, convertBucketsToMdObject } from "../helpers/conversion";
import { getResultSpec } from "../helpers/resultSpec";
import { generateDefaultDimensionsForPointsCharts } from "../helpers/dimensions";
import { BubbleChart as AfmBubbleChart } from "../components/afm/BubbleChart";

import { IDataSourceProviderProps } from "./afm/DataSourceProvider";
import { MEASURES, SECONDARY_MEASURES, TERTIARY_MEASURES, VIEW } from "../constants/bucketNames";

export { IDataSourceProviderProps };

const generateBubbleDimensionsFromBuckets = (buckets: VisualizationObject.IBucket[]) =>
    generateDefaultDimensionsForPointsCharts(convertBucketsToAFM(buckets));

export interface IBubbleChartBucketProps {
    xAxisMeasure?: VisualizationInput.IMeasure;
    yAxisMeasure?: VisualizationInput.IMeasure;
    size?: VisualizationInput.IMeasure;
    viewBy?: VisualizationInput.IAttribute;
    filters?: VisualizationInput.IFilter[];
    sortBy?: VisualizationInput.ISort[];
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
            items: props.xAxisMeasure ? [props.xAxisMeasure] : [],
        },
        {
            localIdentifier: SECONDARY_MEASURES,
            items: props.yAxisMeasure ? [props.yAxisMeasure] : [],
        },
        {
            localIdentifier: TERTIARY_MEASURES,
            items: props.size ? [props.size] : [],
        },
        {
            localIdentifier: VIEW,
            items: props.viewBy ? [props.viewBy] : [],
        },
    ];

    const newProps: IBubbleChartNonBucketProps = omit<IBubbleChartProps, keyof IBubbleChartBucketProps>(
        props,
        ["xAxisMeasure", "yAxisMeasure", "size", "viewBy", "filters", "sortBy"],
    );

    newProps.config = {
        ...newProps.config,
        mdObject: convertBucketsToMdObject(buckets, props.filters, "local:bubble"),
    };

    return (
        <AfmBubbleChart
            {...newProps}
            afm={convertBucketsToAFM(buckets, props.filters)}
            resultSpec={getResultSpec(buckets, props.sortBy, generateBubbleDimensionsFromBuckets)}
        />
    );
}
