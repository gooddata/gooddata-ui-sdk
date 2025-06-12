// (C) 2007-2023 GoodData Corporation
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
import { roundChartDimensions } from "../_commons/dimensions.js";
import { IBucketChartProps } from "../../interfaces/index.js";
import { CorePieChart } from "./CorePieChart.js";
import { IChartDefinition } from "../_commons/chartDefinition.js";
import { withChart } from "../_base/withChart.js";

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

        const sortBy = (props.sortBy as ISortItem[]) ?? [];

        return backend
            .withTelemetry("PieChart", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters as INullableFilter[])
            .withSorting(...sortBy)
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
     * @remarks
     * If you specify a single measure, then you may further specify the viewBy attribute - there will be a
     * pie slice per attribute value.
     *
     * If you specify multiple measures, then there will be a pie slice for each measure value. You may not
     * specify the viewBy in this case.
     */
    measures: AttributesMeasuresOrPlaceholders;

    /**
     * Specify viewBy attribute that will be used to create the pie slices. There will be a slice
     * for each value of the attribute.
     */
    viewBy?: AttributeOrPlaceholder;

    /**
     * Specify filters to apply on the data to chart.
     */
    filters?: NullableFiltersOrPlaceholders;

    /**
     * Specify how to sort the data to chart.
     */
    sortBy?: SortsOrPlaceholders;

    /**
     * Resolution context for composed placeholders.
     */
    placeholdersResolutionContext?: any;
}

/**
 * @public
 */
export interface IPieChartProps extends IBucketChartProps, IPieChartBucketProps {}

const WrappedPieChart = withChart(pieChartDefinition)(CorePieChart);

/**
 * Pie chart shows data as proportional segments of a disc.
 *
 * @remarks
 * Pie charts can be segmented by either multiple measures or an attribute.
 *
 * See {@link IPieChartProps} to learn how to configure the PieChart and the
 * {@link https://sdk.gooddata.com/gooddata-ui/docs/pie_chart_component.html | pie chart documentation} for more information.
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
