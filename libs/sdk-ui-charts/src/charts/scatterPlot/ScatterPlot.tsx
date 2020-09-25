// (C) 2007-2018 GoodData Corporation
import { IAttribute, IMeasure, INullableFilter, ISortItem, newBucket } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { pointyChartDimensions } from "../_commons/dimensions";
import { IBucketChartProps } from "../../interfaces";
import { CoreScatterPlot } from "./CoreScatterPlot";
import { IChartDefinition } from "../_commons/chartDefinition";
import { withChart } from "../_base/withChart";

//
// Internals
//

const scatterPlotDefinition: IChartDefinition<IScatterPlotBucketProps, IScatterPlotProps> = {
    chartName: "ScatterPlot",
    bucketPropsKeys: ["xAxisMeasure", "yAxisMeasure", "attribute", "filters", "sortBy"],
    bucketsFactory: (props) => {
        return [
            newBucket(BucketNames.MEASURES, props.xAxisMeasure),
            newBucket(BucketNames.SECONDARY_MEASURES, props.yAxisMeasure),
            newBucket(BucketNames.ATTRIBUTE, props.attribute),
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace } = props;

        return backend
            .withTelemetry("ScatterPlot", props)
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
export interface IScatterPlotBucketProps {
    /**
     * Optionally specify measure which will be used to position data points on the X axis.
     */
    xAxisMeasure?: IMeasure;

    /**
     * Optionally specify measure which will be used to position data points on the Y axis.
     */
    yAxisMeasure?: IMeasure;

    /**
     * Optionally specify attribute whose values will be used to create data points.
     */
    attribute?: IAttribute;

    /**
     * Optionally specify filters to apply on the data to chart.
     */
    filters?: INullableFilter[];

    /**
     * Optionally specify how to sort the data to chart.
     */
    sortBy?: ISortItem[];
}

/**
 * @public
 */
export interface IScatterPlotProps extends IBucketChartProps, IScatterPlotBucketProps {}

/**
 * [ScatterPlot](http://sdk.gooddata.com/gooddata-ui/docs/scatter_plot_component.html)
 *
 * Scatter plot shows data as points using Cartesian coordinates.
 *
 * Scatter plots typically have a minimum of two measures, one for the X-axis and the other for the Y-axis, and one
 * attribute, which determines the meaning of each data point. Scatter plots are useful for analyzing trends between
 * two measures or for tracking the magnitude of two measures from the same chart.
 *
 * @public
 */
export const ScatterPlot = withChart(scatterPlotDefinition)(CoreScatterPlot);
