// (C) 2007-2023 GoodData Corporation
import React from "react";
import { IAttribute, IAttributeOrMeasure, INullableFilter, ISortItem, newBucket } from "@gooddata/sdk-model";
import {
    BucketNames,
    useResolveValuesWithPlaceholders,
    NullableFiltersOrPlaceholders,
    SortsOrPlaceholders,
    AttributeMeasureOrPlaceholder,
    AttributeOrPlaceholder,
    AttributesMeasuresOrPlaceholders,
} from "@gooddata/sdk-ui";
import { roundChartDimensions } from "../_commons/dimensions.js";
import { IBucketChartProps } from "../../interfaces/index.js";
import { CoreDonutChart } from "./CoreDonutChart.js";
import { IChartDefinition } from "../_commons/chartDefinition.js";
import { withChart } from "../_base/withChart.js";

//
// Internals
//

const donutChartDefinition: IChartDefinition<IDonutChartBucketProps, IDonutChartProps> = {
    chartName: "DonutChart",
    bucketPropsKeys: ["measures", "viewBy", "filters", "sortBy"],
    bucketsFactory: (props) => {
        const measures = (
            Array.isArray(props.measures) ? props.measures : [props.measures]
        ) as IAttributeOrMeasure[];

        return [
            newBucket(BucketNames.MEASURES, ...measures),
            newBucket(BucketNames.VIEW, props.viewBy as IAttribute),
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace, execConfig } = props;

        const sortBy = (props.sortBy as ISortItem[]) ?? [];

        return backend
            .withTelemetry("DonutChart", props)
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
export interface IDonutChartBucketProps {
    /**
     * Specify one or more measures to segment the donut chart.
     *
     * @remarks
     * If you specify a single measure, then you may further specify the viewBy attribute - there will be
     * donut slice per attribute value.
     *
     * If you specify multiple measures, then there will be a donut slice for each measure value. You may not
     * specify the viewBy in this case.
     */
    measures: AttributeMeasureOrPlaceholder | AttributesMeasuresOrPlaceholders;

    /**
     * Specify viewBy attribute that will be used to create the donut slices. There will be a slice
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
export interface IDonutChartProps extends IBucketChartProps, IDonutChartBucketProps {}

const WrappedDonutChart = withChart(donutChartDefinition)(CoreDonutChart);

/**
 * Donut chart shows data as proportional segments of a disc and has a hollowed out center.
 *
 * @remarks
 * Donut charts can be segmented by either multiple measures or an attribute, and allow viewers to visualize
 * component parts of a whole.
 *
 * Note: the donut chart slices are by default sorted from largest to smallest. There is also a limit on the
 * number of slices that will be charted.
 *
 * See {@link IDonutChartProps} to learn how to configure the DonutChart and
 * {@link https://sdk.gooddata.com/gooddata-ui/docs/donut_chart_component.html | donut chart documentation} for more information.
 *
 * @public
 */
export const DonutChart = (props: IDonutChartProps) => {
    const [measures, viewBy, filters, sortBy] = useResolveValuesWithPlaceholders(
        [props.measures, props.viewBy, props.filters, props.sortBy],
        props.placeholdersResolutionContext,
    );

    return (
        <WrappedDonutChart
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
