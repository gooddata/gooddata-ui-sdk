// (C) 2007-2018 GoodData Corporation
import { IAttributeOrMeasure, IAttribute, IFilter, newBucket, ISortItem } from "@gooddata/sdk-model";
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
    chartName: "DonutChart",
    bucketPropsKeys: ["measures", "viewBy", "filters", "sortBy"],
    bucketsFactory: props => {
        const measures: IAttributeOrMeasure[] = Array.isArray(props.measures)
            ? props.measures
            : [props.measures];

        return [newBucket(BucketNames.MEASURES, ...measures), newBucket(BucketNames.VIEW, props.viewBy)];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace } = props;

        return backend
            .withTelemetry("DonutChart", props)
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
export interface IDonutChartBucketProps {
    /**
     * Specify one or more measures to segment the donut chart.
     *
     * If you specify a single measure, then you may further specify the viewBy attribute - there will be
     * donut slice per attribute value.
     *
     * If you specify multiple measures, then there will be a donut slice for each measure value. You may not
     * specify the viewBy in this case.
     */
    measures: IAttributeOrMeasure | IAttributeOrMeasure[];

    /**
     * Optionally specify viewBy attribute that will be used to create the donut slices. There will be a slice
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
export interface IDonutChartProps extends IBucketChartProps, IDonutChartBucketProps {}

/**
 * [DonutChart](http://sdk.gooddata.com/gooddata-ui/docs/donut_chart_component.html)
 *
 * Donut chart shows data as proportional segments of a disc and has a hollowed out center.
 * Donut charts can be segmented by either multiple measures or an attribute, and allow viewers to visualize
 * component parts of a whole.
 *
 * Note: the donut chart slices are by default sorted from largest to smallest. There is also a limit on the
 * number of slices that will be charted.
 *
 * @public
 */
export const DonutChart = withChart(donutChartDefinition)(CoreDonutChart);
