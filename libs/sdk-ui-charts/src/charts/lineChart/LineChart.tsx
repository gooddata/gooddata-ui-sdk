// (C) 2007-2023 GoodData Corporation
import React from "react";
import {
    IAttribute,
    IAttributeOrMeasure,
    IExecutionDefinition,
    INullableFilter,
    ISortItem,
    newBucket,
} from "@gooddata/sdk-model";
import {
    AttributeOrPlaceholder,
    AttributesMeasuresOrPlaceholders,
    BucketNames,
    useResolveValuesWithPlaceholders,
    NullableFiltersOrPlaceholders,
    SortsOrPlaceholders,
} from "@gooddata/sdk-ui";

import { stackedChartDimensions } from "../_commons/dimensions.js";
import { IBucketChartProps } from "../../interfaces/index.js";
import { CoreLineChart } from "./CoreLineChart.js";
import { IChartDefinition } from "../_commons/chartDefinition.js";
import { withChart } from "../_base/withChart.js";

//
// Internals
//

function lineChartDimensions(def: IExecutionDefinition) {
    return stackedChartDimensions(def, BucketNames.TREND, BucketNames.SEGMENT);
}

const lineChartDefinition: IChartDefinition<ILineChartBucketProps, ILineChartProps> = {
    chartName: "LineChart",
    bucketPropsKeys: ["measures", "trendBy", "segmentBy", "filters", "sortBy"],
    bucketsFactory: (props) => {
        return [
            newBucket(BucketNames.MEASURES, ...(props.measures as IAttributeOrMeasure[])),
            newBucket(BucketNames.TREND, props.trendBy as IAttribute),
            newBucket(BucketNames.SEGMENT, props.segmentBy as IAttribute),
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace, execConfig } = props;

        const sortBy = (props.sortBy as ISortItem[]) ?? [];

        return backend
            .withTelemetry("LineChart", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters as INullableFilter[])
            .withSorting(...sortBy)
            .withDimensions(lineChartDimensions)
            .withExecConfig(execConfig);
    },
};

//
// Public interface
//

/**
 * @public
 */
export interface ILineChartBucketProps {
    /**
     * Specify one or more measures whose values will be displayed on the line chart.
     *
     * @remarks
     * If you specify two or more measures, values of each measure will have their own line.
     */
    measures: AttributesMeasuresOrPlaceholders;

    /**
     * Specify single attribute whose values will be used to slice the lines along the X axis.
     */
    trendBy?: AttributeOrPlaceholder;

    /**
     * Specify single attribute whose values will be used to segment the measure values.
     *
     * @remarks
     * The line chart will display one line per measure values pertaining to the segmentBy attribute values.
     */
    segmentBy?: AttributeOrPlaceholder;

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
export interface ILineChartProps extends IBucketChartProps, ILineChartBucketProps {}

const WrappedLineChart = withChart(lineChartDefinition)(CoreLineChart);

/**
 * Line chart shows data as line-connected dots.
 *
 * @remarks
 * Line charts can display either multiple measures as individual lines
 * or a single measure split by one attribute into multiple lines with points intersecting attribute values.
 *
 * See {@link ILineChartProps} to learn how to configure the LineChart and the
 * {@link https://sdk.gooddata.com/gooddata-ui/docs/line_chart_component.html | line chart documentation} for more information.
 *
 * @public
 */
export const LineChart = (props: ILineChartProps) => {
    const [measures, trendBy, segmentBy, filters, sortBy] = useResolveValuesWithPlaceholders(
        [props.measures, props.trendBy, props.segmentBy, props.filters, props.sortBy],
        props.placeholdersResolutionContext,
    );

    return (
        <WrappedLineChart
            {...props}
            {...{
                measures,
                trendBy,
                segmentBy,
                filters,
                sortBy,
            }}
        />
    );
};
