// (C) 2007-2018 GoodData Corporation
import {
    IAttributeOrMeasure,
    IAttribute,
    IFilter,
    ISortItem,
    newBucket,
    IExecutionDefinition,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { stackedChartDimensions } from "../_commons/dimensions";
import { IBucketChartProps } from "../../interfaces";
import { CoreLineChart } from "./CoreLineChart";
import { IChartDefinition } from "../_commons/chartDefinition";
import { withChart } from "../_base/withChart";

//
// Internals
//

function lineChartDimensions(def: IExecutionDefinition) {
    return stackedChartDimensions(def, BucketNames.TREND, BucketNames.SEGMENT);
}

const lineChartDefinition: IChartDefinition<ILineChartBucketProps, ILineChartProps> = {
    chartName: "LineChart",
    bucketPropsKeys: ["measures", "trendBy", "segmentBy", "filters", "sortBy"],
    bucketsFactory: (props) => {
        return [
            newBucket(BucketNames.MEASURES, ...props.measures),
            newBucket(BucketNames.TREND, props.trendBy),
            newBucket(BucketNames.SEGMENT, props.segmentBy),
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace } = props;

        return backend
            .withTelemetry("LineChart", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters)
            .withSorting(...props.sortBy)
            .withDimensions(lineChartDimensions);
    },
};

//
// Public interface
//

/**
 * @public
 */
export interface ILineChartBucketProps {
    /**
     * Specify one or more measures whose values will be displayed on the line chart.
     *
     * If you specify two or more measures, values of each measure will have their own line.
     */
    measures: IAttributeOrMeasure[];

    /**
     * Optionally specify single attribute whose values will be used to slice the lines along the X axis.
     */
    trendBy?: IAttribute;

    /**
     * Optionally specify single attribute whose values will be used to segment the measure values. The line
     * chart will display one line per measure values pertaining to the segmentBy attribute values.
     */
    segmentBy?: IAttribute;

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
export interface ILineChartProps extends IBucketChartProps, ILineChartBucketProps {}

/**
 * [LineChart](http://sdk.gooddata.com/gooddata-ui/docs/line_chart_component.html)
 *
 * Line chart shows data as line-connected dots. Line charts can display either multiple measures as individual lines
 * or a single measure split by one attribute into multiple lines with points intersecting attribute values.
 *
 * @public
 */
export const LineChart = withChart(lineChartDefinition)(CoreLineChart);
