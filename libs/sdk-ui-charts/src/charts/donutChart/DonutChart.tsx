// (C) 2007-2018 GoodData Corporation
import { AttributeOrMeasure, IAttribute, IFilter, newBucket } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { roundChartDimensions } from "../_commons/dimensions";
import { IBucketChartProps } from "../../interfaces";
import { CoreDonutChart } from "./CoreDonutChart";
import { IChartDefinition } from "../_commons/chartDefinition";
import { withChart } from "../_base/withChart";

//
// Internals
//

const donutChartDefinition: IChartDefinition<IDonutChartBucketProps, IDonutChartProps> = {
    bucketPropsKeys: ["measures", "viewBy", "filters"],
    bucketsFactory: props => {
        return [
            newBucket(BucketNames.MEASURES, ...props.measures),
            newBucket(BucketNames.VIEW, props.viewBy),
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace } = props;

        return backend
            .withTelemetry("DonutChart", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters)
            .withDimensions(roundChartDimensions);
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
export interface IDonutChartBucketProps {
    measures: AttributeOrMeasure[];
    viewBy?: IAttribute;
    filters?: IFilter[];
}

/**
 * TODO: SDK8: add docs
 *
 * @public
 */
export interface IDonutChartProps extends IBucketChartProps, IDonutChartBucketProps {}

/**
 * [DonutChart](http://sdk.gooddata.com/gooddata-ui/docs/donut_chart_component.html)
 * is a component with bucket props measures, viewBy, filters
 *
 * @public
 */
export const DonutChart = withChart(donutChartDefinition)(CoreDonutChart);
