// (C) 2007-2018 GoodData Corporation
import { AttributeOrMeasure, IAttribute, IFilter, SortItem, newBucket } from "@gooddata/sdk-model";
import { BucketNames } from "../../base";
import { roundChartDimensions } from "../_commons/dimensions";
import { IBucketChartProps } from "../chartProps";
import { CorePieChart } from "./CorePieChart";
import { IChartDefinition } from "../_commons/chartDefinition";
import { withChart } from "../_base/withChart";

//
// Internals
//

const pieChartDefinition: IChartDefinition<IPieChartBucketProps, IPieChartProps> = {
    bucketPropsKeys: ["measures", "viewBy", "filters", "sortBy"],
    bucketsFactory: props => {
        return [
            newBucket(BucketNames.MEASURES, ...props.measures),
            newBucket(BucketNames.VIEW, props.viewBy),
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace } = props;

        return backend
            .withTelemetry("PieChart", props)
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
export interface IPieChartBucketProps {
    measures: AttributeOrMeasure[];
    viewBy?: IAttribute;
    filters?: IFilter[];
    sortBy?: SortItem[];
}

/**
 * TODO: SDK8: add docs
 *
 * @public
 */
export interface IPieChartProps extends IBucketChartProps, IPieChartBucketProps {}

/**
 * [PieChart](http://sdk.gooddata.com/gooddata-ui/docs/pie_chart_component.html)
 * is a component with bucket props measures, viewBy, filters
 *
 * @public
 */
export const PieChart = withChart(pieChartDefinition)(CorePieChart);
