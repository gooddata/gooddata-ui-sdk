// (C) 2007-2026 GoodData Corporation

import {
    type IAttribute,
    type IMeasure,
    type INullableFilter,
    type ISortItem,
    newBucket,
} from "@gooddata/sdk-model";
import {
    type AttributeOrPlaceholder,
    BucketNames,
    type MeasureOrPlaceholder,
    type NullableFiltersOrPlaceholders,
    type SortsOrPlaceholders,
    useResolveValuesWithPlaceholders,
} from "@gooddata/sdk-ui";

import { CoreBubbleChart } from "./CoreBubbleChart.js";
import { type IBucketChartProps } from "../../interfaces/chartProps.js";
import { withChart } from "../_base/withChart.js";
import { type IChartDefinition } from "../_commons/chartDefinition.js";
import { pointyChartDimensions } from "../_commons/dimensions.js";

//
// Internals
//

const bubbleChartDefinition: IChartDefinition<IBubbleChartBucketProps, IBubbleChartProps> = {
    chartName: "BubbleChart",
    bucketPropsKeys: ["xAxisMeasure", "yAxisMeasure", "size", "viewBy", "filters", "sortBy"],
    bucketsFactory: (props) => {
        return [
            newBucket(BucketNames.MEASURES, props.xAxisMeasure as IMeasure),
            newBucket(BucketNames.SECONDARY_MEASURES, props.yAxisMeasure as IMeasure),
            newBucket(BucketNames.TERTIARY_MEASURES, props.size as IMeasure),
            newBucket(BucketNames.VIEW, props.viewBy as IAttribute),
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace, execConfig } = props;

        const sortBy = (props.sortBy as ISortItem[]) ?? [];

        return backend!
            .withTelemetry("BubbleChart", props)
            .workspace(workspace!)
            .execution()
            .forBuckets(buckets, props.filters as INullableFilter[])
            .withSorting(...sortBy)
            .withDimensions(pointyChartDimensions)
            .withExecConfig(execConfig!);
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
     * Specify measure which will be used to position bubbles on the X axis.
     */
    xAxisMeasure?: MeasureOrPlaceholder;

    /**
     * Specify measure which will be used to position bubbles on the Y axis
     */
    yAxisMeasure?: MeasureOrPlaceholder;

    /**
     * Specify measure which will be used to determine the size of each bubble.
     */
    size?: MeasureOrPlaceholder;

    /**
     * Specify attribute whose values will be used to create the bubbles.
     */
    viewBy?: AttributeOrPlaceholder;

    /**
     * Specify filters to apply on the data to chart.
     */
    filters?: NullableFiltersOrPlaceholders;

    /**
     * Specify how to sort the data to chart.
     */
    sortBy?: SortsOrPlaceholders;

    /**
     * Resolution context for composed placeholders.
     */
    placeholdersResolutionContext?: any;
}

/**
 * @public
 */
export interface IBubbleChartProps extends IBucketChartProps, IBubbleChartBucketProps {}

const WrappedBubbleChart = withChart(bubbleChartDefinition)(CoreBubbleChart);

/**
 * Bubble chart shows data as bubbles using Cartesian coordinates.
 *
 * @remarks
 * Bubble charts typically have three measures, one
 * for the X-axis, one for the Y-axis, and one that determines the size of each bubble. The data is sliced by an
 * attribute, with each bubble (an attribute item) noted with a different color.
 *
 * See {@link IBubbleChartProps} to learn how to configure the BubbleChart and the
 * {@link https://www.gooddata.com/docs/gooddata-ui/latest/references/visual_components/bubble_chart | bubble chart documentation} for more information.
 *
 * @public
 */
export function BubbleChart(props: IBubbleChartProps) {
    const [xAxisMeasure, yAxisMeasure, size, viewBy, filters, sortBy] = useResolveValuesWithPlaceholders(
        [props.xAxisMeasure, props.yAxisMeasure, props.size, props.viewBy, props.filters, props.sortBy],
        props.placeholdersResolutionContext,
    );

    return (
        <WrappedBubbleChart
            {...props}
            {...{
                xAxisMeasure,
                yAxisMeasure,
                size,
                viewBy,
                filters,
                sortBy,
            }}
        />
    );
}
