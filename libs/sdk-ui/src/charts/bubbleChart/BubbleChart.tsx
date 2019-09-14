// (C) 2007-2018 GoodData Corporation
import { IAttribute, IFilter, IMeasure, SortItem } from "@gooddata/sdk-model";
import * as React from "react";
import { IBucketChartProps } from "../chartProps";
import { MEASURES, SECONDARY_MEASURES, TERTIARY_MEASURES, VIEW } from "../../base/constants/bucketNames";
import { pointyChartDimensions } from "../_commons/dimensions";
import { CoreBubbleChart } from "./CoreBubbleChart";
import { IChartDefinition, getCoreChartProps } from "../_commons/chartDefinition";

export interface IBubbleChartBucketProps {
    xAxisMeasure?: IMeasure;
    yAxisMeasure?: IMeasure;
    size?: IMeasure;
    viewBy?: IAttribute;
    filters?: IFilter[];
    sortBy?: SortItem[];
}

export interface IBubbleChartProps extends IBucketChartProps, IBubbleChartBucketProps {
    workspace: string;
}

const bubbleChartDefinition: IChartDefinition<IBubbleChartBucketProps, IBubbleChartProps> = {
    bucketPropsKeys: ["xAxisMeasure", "yAxisMeasure", "size", "viewBy", "filters", "sortBy"],
    bucketsFactory: props => {
        return [
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
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace } = props;

        return backend
            .withTelemetry("BubbleChart", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters)
            .withSorting(...props.sortBy)
            .withDimensions(pointyChartDimensions);
    },
};

const getProps = getCoreChartProps(bubbleChartDefinition);

/**
 * [BubbleChart](http://sdk.gooddata.com/gdc-ui-sdk-doc/)
 */
export function BubbleChart(props: IBubbleChartProps): JSX.Element {
    return <CoreBubbleChart {...getProps(props)} />;
}
