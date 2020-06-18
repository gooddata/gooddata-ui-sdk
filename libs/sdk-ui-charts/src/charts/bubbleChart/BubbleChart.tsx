// (C) 2007-2018 GoodData Corporation
import { IAttribute, IFilter, IMeasure, newBucket, ISortItem } from "@gooddata/sdk-model";
import { IBucketChartProps } from "../../interfaces";
import { BucketNames } from "@gooddata/sdk-ui";
import { pointyChartDimensions } from "../_commons/dimensions";
import { CoreBubbleChart } from "./CoreBubbleChart";
import { IChartDefinition } from "../_commons/chartDefinition";
import { withChart } from "../_base/withChart";

//
// Internals
//

const bubbleChartDefinition: IChartDefinition<IBubbleChartBucketProps, IBubbleChartProps> = {
    chartName: "BubbleChart",
    bucketPropsKeys: ["xAxisMeasure", "yAxisMeasure", "size", "viewBy", "filters", "sortBy"],
    bucketsFactory: (props) => {
        return [
            newBucket(BucketNames.MEASURES, props.xAxisMeasure),
            newBucket(BucketNames.SECONDARY_MEASURES, props.yAxisMeasure),
            newBucket(BucketNames.TERTIARY_MEASURES, props.size),
            newBucket(BucketNames.VIEW, props.viewBy),
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

//
// Public interface
//

/**
 * @public
 */
export interface IBubbleChartBucketProps {
    /**
     * Optionally specify measure which will be used to position bubbles on the X axis.
     */
    xAxisMeasure?: IMeasure;

    /**
     * Optionally specify measure which will be used to position bubbles on the Y axis
     */
    yAxisMeasure?: IMeasure;

    /**
     * Optionally specify measure which will be used to determine the size of each bubble.
     */
    size?: IMeasure;

    /**
     * Optionally specify attribute whose values will be used to create the bubbles.
     */
    viewBy?: IAttribute;

    /**
     * Optionally specify filters to apply on the data to chart.
     */
    filters?: IFilter[];

    /**
     * Optionally specify how to sort the data to chart.
     */
    sortBy?: ISortItem[];
}

/**
 * @public
 */
export interface IBubbleChartProps extends IBucketChartProps, IBubbleChartBucketProps {}

/**
 * [BubbleChart](http://sdk.gooddata.com/gdc-ui-sdk-doc/)
 *
 * Bubble chart shows data as bubbles using Cartesian coordinates. Bubble charts typically have three measures, one
 * for the X-axis, one for the Y-axis, and one that determines the size of each bubble. The data is sliced by an
 * attribute, with each bubble (an attribute item) noted with a different color.
 *
 * @public
 */
export const BubbleChart = withChart(bubbleChartDefinition)(CoreBubbleChart);
