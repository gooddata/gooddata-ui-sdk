// (C) 2007-2022 GoodData Corporation
import React from "react";
import { IAttribute, IAttributeOrMeasure, INullableFilter, ISortItem, newBucket } from "@gooddata/sdk-model";
import {
    BucketNames,
    useResolveValuesWithPlaceholders,
    NullableFiltersOrPlaceholders,
    SortsOrPlaceholders,
    AttributeOrPlaceholder,
    AttributesMeasuresOrPlaceholders,
} from "@gooddata/sdk-ui";
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
    bucketsFactory: (props) => {
        return [
            newBucket(BucketNames.MEASURES, ...(props.measures as IAttributeOrMeasure[])),
            newBucket(BucketNames.VIEW, props.viewBy as IAttribute),
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace, execConfig } = props;

        return backend
            .withTelemetry("PieChart", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters as INullableFilter[])
            .withSorting(...(props.sortBy as ISortItem[]))
            .withDimensions(roundChartDimensions)
            .withExecConfig(execConfig);
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
    measures: AttributesMeasuresOrPlaceholders;

    /**
     * Optionally specify viewBy attribute that will be used to create the pie slices. There will be a slice
     * for each value of the attribute.
     */
    viewBy?: AttributeOrPlaceholder;

    /**
     * Optionally specify filters to apply on the data to chart.
     */
    filters?: NullableFiltersOrPlaceholders;

    /**
     * Optionally specify how to sort the data to chart.
     */
    sortBy?: SortsOrPlaceholders;

    /**
     * Optional resolution context for composed placeholders.
     */
    placeholdersResolutionContext?: any;
}

/**
 * @public
 */
export interface IPieChartProps extends IBucketChartProps, IPieChartBucketProps {}

const WrappedPieChart = withChart(pieChartDefinition)(CorePieChart);

/**
 * [PieChart](http://sdk.gooddata.com/gooddata-ui/docs/pie_chart_component.html)
 *
 * Pie chart shows data as proportional segments of a disc. Pie charts can be segmented by either multiple measures or an attribute.
 *
 * @public
 */
export const PieChart = (props: IPieChartProps) => {
    const [measures, viewBy, filters, sortBy] = useResolveValuesWithPlaceholders(
        [props.measures, props.viewBy, props.filters, props.sortBy],
        props.placeholdersResolutionContext,
    );

    return (
        <WrappedPieChart
            {...props}
            {...{
                measures,
                viewBy,
                filters,
                sortBy,
            }}
        />
    );
};
