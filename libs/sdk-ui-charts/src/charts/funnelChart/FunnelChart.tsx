// (C) 2007-2022 GoodData Corporation
import React from "react";
import { IAttribute, IAttributeOrMeasure, INullableFilter, newBucket } from "@gooddata/sdk-model";
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
import { CoreFunnelChart } from "./CoreFunnelChart";
import { IChartDefinition } from "../_commons/chartDefinition";
import { withChart } from "../_base/withChart";

//
// Internals
//

const funnelChartDefinition: IChartDefinition<IFunnelChartBucketProps, IFunnelChartProps> = {
    chartName: "FunnelChart",
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
            .withTelemetry("FunnelChart", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters as INullableFilter[])
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
export interface IFunnelChartBucketProps {
    /**
     * Specify one or more measures to chart into a funnel.
     *
     * @remarks
     * If you specify single measure, then you can also specify the viewBy attribute. Values of that attribute
     * will be used for slicing and will be charted as a funnel.
     *
     * If you specify multiple measures, then those calculate measure values will be charted into a funnel.
     */
    measures: AttributesMeasuresOrPlaceholders;

    /**
     * Specify attribute that will be used to slice the single measure into multiple pieces that
     * will be charted into a funnel.
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
export interface IFunnelChartProps extends IBucketChartProps, IFunnelChartBucketProps {}

const WrappedFunnelChart = withChart(funnelChartDefinition)(CoreFunnelChart);

/**
 * A funnel chart displays values as progressively decreasing proportions.
 *
 * @remarks
 * You can define funnel chart using either multiple measures or single measure and a viewBy attribute whose
 * values will be used to slice the single measure.
 *
 * In either case, the measure values will be charted into a funnel. With the largest values being on the broadest
 * part of the funnel, and the smallest values towards the narrow part of the funnel.
 *
 * See {@link IFunnelChartProps} to learn how to configure the FunnelChart.
 *
 * @public
 */
export const FunnelChart = (props: IFunnelChartProps) => {
    const [measures, viewBy, filters, sortBy] = useResolveValuesWithPlaceholders(
        [props.measures, props.viewBy, props.filters, props.sortBy],
        props.placeholdersResolutionContext,
    );

    return (
        <WrappedFunnelChart
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
