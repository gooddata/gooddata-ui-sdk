// (C) 2007-2018 GoodData Corporation
import { IAttribute, IFilter, IMeasure, newBucket, SortItem } from "@gooddata/sdk-model";
import { IBucketChartProps } from "../chartProps";
import { MEASURES, SECONDARY_MEASURES, TERTIARY_MEASURES, VIEW } from "../../base/constants/bucketNames";
import { pointyChartDimensions } from "../_commons/dimensions";
import { CoreBubbleChart } from "./CoreBubbleChart";
import { IChartDefinition } from "../_commons/chartDefinition";
import { withChart } from "../_base/withChart";

//
// Internals
//

const bubbleChartDefinition: IChartDefinition<IBubbleChartBucketProps, IBubbleChartProps> = {
    bucketPropsKeys: ["xAxisMeasure", "yAxisMeasure", "size", "viewBy", "filters", "sortBy"],
    bucketsFactory: props => {
        return [
            newBucket(MEASURES, props.xAxisMeasure),
            newBucket(SECONDARY_MEASURES, props.yAxisMeasure),
            newBucket(TERTIARY_MEASURES, props.size),
            newBucket(VIEW, props.viewBy),
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
 * TODO: SDK8: add docs
 * TODO: SDK8: check whether it's ok that all the buckets are optional
 * @public
 */
export interface IBubbleChartBucketProps {
    xAxisMeasure?: IMeasure;
    yAxisMeasure?: IMeasure;
    size?: IMeasure;
    viewBy?: IAttribute;
    filters?: IFilter[];
    sortBy?: SortItem[];
}

/**
 * TODO: SDK8: add docs
 *
 * @public
 */
export interface IBubbleChartProps extends IBucketChartProps, IBubbleChartBucketProps {}

/**
 * [BubbleChart](http://sdk.gooddata.com/gdc-ui-sdk-doc/)
 *
 * @public
 */
export const BubbleChart = withChart(bubbleChartDefinition)(CoreBubbleChart);
