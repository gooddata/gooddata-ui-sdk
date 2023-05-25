// (C) 2007-2022 GoodData Corporation
import React from "react";
import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
    bucketsAttributes,
    IAttribute,
    IBucket,
    IMeasure,
    INullableFilter,
    MeasureGroupIdentifier,
    newBucket,
    newDimension,
} from "@gooddata/sdk-model";
import {
    BucketNames,
    Subtract,
    useResolveValuesWithPlaceholders,
    MeasureOrPlaceholder,
    AttributeOrPlaceholder,
    NullableFiltersOrPlaceholders,
    withContexts,
} from "@gooddata/sdk-ui";
import { IBucketChartProps, ICoreChartProps } from "../../interfaces/index.js";
import { CoreXirr } from "./CoreXirr.js";
import omit from "lodash/omit.js";

//
// Public interface
//

/**
 * @beta
 */
export interface IXirrBucketProps {
    /**
     * The measure to calculate the Internal Rate of Return for.
     *
     * @remarks
     * For the result to make sense, the measure should start with a negative value at some point in time (the investment) followed by other values (the returns).
     */
    measure: MeasureOrPlaceholder;
    /**
     * The date dimension to use for the computation. This allows you to set the granularity (day, month, etc.) for the IRR calculation.
     */
    attribute?: AttributeOrPlaceholder;
    /**
     * Specify filters to apply on the data to compute with.
     */
    filters?: NullableFiltersOrPlaceholders;

    /**
     * Resolution context for composed placeholders.
     */
    placeholdersResolutionContext?: any;
}

/**
 * @beta
 */
export interface IXirrProps extends IBucketChartProps, IXirrBucketProps {}

const WrappedXirr = withContexts(RenderXirr);

/**
 * Xirr computes the {@link https://en.wikipedia.org/wiki/Internal_rate_of_return | Internal Rate of Return} from the given measure and date dimension.
 *
 *
 * @remarks
 * The "X" in the name means that the returns do not have to happen periodically (as in the standard IRR), but they
 * can {@link https://en.wikipedia.org/wiki/Internal_rate_of_return#Exact_dates_of_cash_flows | happen at any day}.
 * You must specify both the measure and date dimension.
 *
 * For date parsing, we currently use the browser's Date constructor. There might be some differences
 * between how browsers implement this, so for best results use the Day granularity if possible.
 *
 * See {@link IXirrProps} to learn how to configure the Xirr.
 *
 * @beta
 */
export const Xirr = (props: IXirrProps): JSX.Element => {
    const [measure, attribute, filters] = useResolveValuesWithPlaceholders(
        [props.measure, props.attribute, props.filters],
        props.placeholdersResolutionContext,
    );

    return <WrappedXirr {...props} {...{ measure, attribute, filters }} />;
};

export function RenderXirr(props: IXirrProps): JSX.Element {
    return <CoreXirr {...toCoreXirrProps(props)} />;
}

//
// Internals
//

type IIrrelevantXirrProps = IXirrBucketProps & IBucketChartProps;
type IXirrNonBucketProps = Subtract<IXirrProps, IIrrelevantXirrProps>;

export function toCoreXirrProps(props: IXirrProps): ICoreChartProps {
    const buckets = [
        newBucket(BucketNames.MEASURES, props.measure as IMeasure),
        newBucket(BucketNames.ATTRIBUTE, props.attribute as IAttribute),
    ];

    const newProps: IXirrNonBucketProps = omit<IXirrProps, keyof IIrrelevantXirrProps>(props, [
        "measure",
        "attribute",
        "filters",
        "backend",
    ]);

    return {
        ...newProps,
        execution: createExecution(buckets, props),
        exportTitle: props.exportTitle || "Xirr",
    };
}

function createExecution(buckets: IBucket[], props: IXirrProps): IPreparedExecution {
    const { backend, workspace, execConfig } = props;

    return backend
        .withTelemetry("Xirr", props)
        .workspace(workspace)
        .execution()
        .forBuckets(buckets, props.filters as INullableFilter[])
        .withDimensions(newDimension([MeasureGroupIdentifier, ...bucketsAttributes(buckets)]))
        .withExecConfig(execConfig);
}
