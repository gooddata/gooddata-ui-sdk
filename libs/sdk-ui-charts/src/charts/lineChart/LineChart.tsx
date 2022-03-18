// (C) 2007-2022 GoodData Corporation
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

import { stackedChartDimensions } from "../_commons/dimensions";
import { IBucketChartProps } from "../../interfaces";
import { CoreLineChart } from "./CoreLineChart";
import { IChartDefinition } from "../_commons/chartDefinition";
import { withChart } from "../_base/withChart";

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

        return backend
            .withTelemetry("LineChart", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters as INullableFilter[])
            .withSorting(...(props.sortBy as ISortItem[]))
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
     * Optionally specify single attribute whose values will be used to slice the lines along the X axis.
     */
    trendBy?: AttributeOrPlaceholder;

    /**
     * Optionally specify single attribute whose values will be used to segment the measure values.
     *
     * @remarks
     * The line chart will display one line per measure values pertaining to the segmentBy attribute values.
     */
    segmentBy?: AttributeOrPlaceholder;

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
export interface ILineChartProps extends IBucketChartProps, ILineChartBucketProps {}

const WrappedLineChart = withChart(lineChartDefinition)(CoreLineChart);

/**
 * Line chart shows data as line-connected dots.
 *
 * @remarks
 * [LineChart](http://sdk.gooddata.com/gooddata-ui/docs/line_chart_component.html)
 *
 * Line charts can display either multiple measures as individual lines
 * or a single measure split by one attribute into multiple lines with points intersecting attribute values.
 *
 * See {@link ILineChartProps} to learn how to configure the LineChart.
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
