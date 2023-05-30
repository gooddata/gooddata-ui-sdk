// (C) 2007-2023 GoodData Corporation
import React from "react";
import { IAttribute, IAttributeOrMeasure, INullableFilter, ISortItem, newBucket } from "@gooddata/sdk-model";
import {
    BucketNames,
    useResolveValuesWithPlaceholders,
    AttributesMeasuresOrPlaceholders,
    AttributeOrPlaceholder,
    NullableFiltersOrPlaceholders,
    SortsOrPlaceholders,
} from "@gooddata/sdk-ui";
import { roundChartDimensions } from "../_commons/dimensions";
import { IBucketChartProps } from "../../interfaces";
import { CorePyramidChart } from "./CorePyramidChart";
import { IChartDefinition } from "../_commons/chartDefinition";
import { withChart } from "../_base/withChart";

//
// Internals
//

const pyramidChartDefinition: IChartDefinition<IPyramidChartBucketProps, IPyramidChartProps> = {
    chartName: "PyramidChart",
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
            .withTelemetry("PyramidChart", props)
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
export interface IPyramidChartBucketProps {
    /**
     * Specify one or more measures to chart into a pyramid.
     *
     * @remarks
     * If you specify single measure, then you can also specify the viewBy attribute. Values of that attribute
     * will be used for slicing and will be charted as a pyramid.
     *
     * If you specify multiple measures, then those calculate measure values will be charted into a pyramid.
     */
    measures: AttributesMeasuresOrPlaceholders;

    /**
     * Specify attribute that will be used to slice the single measure into multiple pieces that
     * will be charted into a pyramid.
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
export interface IPyramidChartProps extends IBucketChartProps, IPyramidChartBucketProps {}

const WrappedPyramidChart = withChart(pyramidChartDefinition)(CorePyramidChart);

/**
 * A pyramid chart displays values on top of each other, useful for example for showing hierarchies or workflows.
 *
 * @remarks
 * You can define pyramid chart using either multiple measures or single measure and a viewBy attribute whose
 * values will be used to slice the single measure.
 *
 * See {@link IPyramidChartProps} to learn how to configure the PyramidChart.
 *
 * @public
 */
export const PyramidChart = (props: IPyramidChartProps) => {
    const [measures, viewBy, filters, sortBy] = useResolveValuesWithPlaceholders(
        [props.measures, props.viewBy, props.filters, props.sortBy],
        props.placeholdersResolutionContext,
    );

    return (
        <WrappedPyramidChart
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
