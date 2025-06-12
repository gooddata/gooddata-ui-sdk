// (C) 2023 GoodData Corporation
import {
    AttributeOrPlaceholder,
    AttributesMeasuresOrPlaceholders,
    BucketNames,
    NullableFiltersOrPlaceholders,
    SortsOrPlaceholders,
    useResolveValuesWithPlaceholders,
} from "@gooddata/sdk-ui";
import { IBucketChartProps } from "../../interfaces/index.js";
import { withChart } from "../_base/withChart.js";
import { CoreWaterfallChart } from "../waterfallChart/CoreWaterfallChart.js";
import React from "react";
import { IChartDefinition } from "../_commons/chartDefinition.js";
import { IAttribute, IAttributeOrMeasure, INullableFilter, ISortItem, newBucket } from "@gooddata/sdk-model";
import { roundChartDimensions } from "../_commons/dimensions.js";

//
// Internals
//

const waterfallChartDefinition: IChartDefinition<IWaterfallChartBucketProps, IWaterfallChartProps> = {
    chartName: "WaterfallChart",
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
            .withTelemetry("WaterfallChart", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters as INullableFilter[])
            .withSorting(...sortBy)
            .withDimensions(roundChartDimensions)
            .withExecConfig(execConfig);
    },
};

/**
 * @public
 */
export interface IWaterfallChartBucketProps {
    /**
     * Specify one or more measures to segment the waterfall chart.
     *
     * @remarks
     * If you specify a single measure, then you may further specify the viewBy attribute
     *
     * If you specify multiple measures, then there will be a column for each measure value. You may not
     * specify the viewBy in this case.
     */
    measures: AttributesMeasuresOrPlaceholders;

    /**
     * Specify viewBy attribute that will be used to create the column There will be a column
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
export interface IWaterfallChartProps extends IBucketChartProps, IWaterfallChartBucketProps {}

const WrappedWaterfallChart = withChart(waterfallChartDefinition)(CoreWaterfallChart);

/**
 * Waterfall chart shows data as proportional segments of a disc.
 *
 * @remarks
 * Waterfall charts can be segmented by either multiple measures or an attribute.
 *
 * See {@link IWaterfallChartProps} to learn how to configure the WaterfallChart and the
 * {@link https://sdk.gooddata.com/gooddata-ui/docs/waterfall_chart_component.html | Waterfall chart documentation} for more information.
 *
 * @public
 */
export const WaterfallChart = (props: IWaterfallChartProps) => {
    const [measures, viewBy, filters, sortBy] = useResolveValuesWithPlaceholders(
        [props.measures, props.viewBy, props.filters, props.sortBy],
        props.placeholdersResolutionContext,
    );

    return (
        <WrappedWaterfallChart
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
