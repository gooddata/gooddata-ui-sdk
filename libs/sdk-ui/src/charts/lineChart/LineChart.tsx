// (C) 2007-2018 GoodData Corporation
import { AttributeOrMeasure, IAttribute, IFilter, SortItem, newBucket } from "@gooddata/sdk-model";
import { ATTRIBUTE, MEASURES, STACK } from "../../base/constants/bucketNames";

import { stackedChartDimensions } from "../_commons/dimensions";
import { IBucketChartProps } from "../chartProps";
import { CoreLineChart } from "./CoreLineChart";
import { IChartDefinition } from "../_commons/chartDefinition";
import { withChart } from "../_base/withChart";

//
// Internals
//

const lineChartDefinition: IChartDefinition<ILineChartBucketProps, ILineChartProps> = {
    bucketPropsKeys: ["measures", "trendBy", "segmentBy", "filters", "sortBy"],
    bucketsFactory: props => {
        return [
            newBucket(MEASURES, ...props.measures),
            newBucket(ATTRIBUTE, props.trendBy),
            newBucket(STACK, props.segmentBy),
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
            .withDimensions(stackedChartDimensions);
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
