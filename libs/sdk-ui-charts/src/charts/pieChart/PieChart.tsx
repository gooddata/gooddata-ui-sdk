// (C) 2007-2018 GoodData Corporation
import { IAttribute, IAttributeOrMeasure, IFilter, ISortItem, newBucket } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { roundChartDimensions } from "../_commons/dimensions";
import { IBucketChartProps } from "../../interfaces";
import { CorePieChart } from "./CorePieChart";
import { IChartDefinition } from "../_commons/chartDefinition";
import { withChart } from "../_base/withChart";

//
// Internals
//

const pieChartDefinition: IChartDefinition<IPieChartBucketProps, IPieChartProps> = {
    chartName: "PieChart",
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
            .withSorting(...props.sortBy)
            .withDimensions(roundChartDimensions);
    },
};

//
// Public interface
//

/**
 * @public
 */
export interface IPieChartBucketProps {
    /**
     * Specify one or more measures to segment the pie chart.
     *
     * If you specify a single measure, then you may further specify the viewBy attribute - there will be a
     * pie slice per attribute value.
     *
     * If you specify multiple measures, then there will be a pie slice for each measure value. You may not
     * specify the viewBy in this case.
     */
    measures: IAttributeOrMeasure[];

    /**
     * Optionally specify viewBy attribute that will be used to create the pie slices. There will be a slice
     * for each value of the attribute.
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
export interface IPieChartProps extends IBucketChartProps, IPieChartBucketProps {}

/**
 * [PieChart](http://sdk.gooddata.com/gooddata-ui/docs/pie_chart_component.html)
 *
 * Pie chart shows data as proportional segments of a disc. Pie charts can be segmented by either multiple measures or an attribute.
 *
 * @public
 */
export const PieChart = withChart(pieChartDefinition)(CorePieChart);
