// (C) 2007-2018 GoodData Corporation
import {
    AttributeOrMeasure,
    IAttribute,
    IFilter,
    SortItem,
    newBucket,
    IExecutionDefinition,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { stackedChartDimensions } from "../_commons/dimensions";
import { IBucketChartProps } from "../chartProps";
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
    bucketPropsKeys: ["measures", "trendBy", "segmentBy", "filters", "sortBy"],
    bucketsFactory: props => {
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
 * TODO: SDK8: add docs
 *
 * @public
 */
export interface ILineChartBucketProps {
    measures: AttributeOrMeasure[];
    trendBy?: IAttribute;
    segmentBy?: IAttribute;
    filters?: IFilter[];
    sortBy?: SortItem[];
}

/**
 * TODO: SDK8: add docs
 *
 * @public
 */
export interface ILineChartProps extends IBucketChartProps, ILineChartBucketProps {}

/**
 * [LineChart](http://sdk.gooddata.com/gooddata-ui/docs/line_chart_component.html)
 * is a component with bucket props measures, trendBy, segmentBy, filters
 *
 * @public
 */
export const LineChart = withChart(lineChartDefinition)(CoreLineChart);
