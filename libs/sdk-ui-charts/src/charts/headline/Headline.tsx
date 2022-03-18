// (C) 2007-2022 GoodData Corporation
import React from "react";
import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
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
    withContexts,
    MeasureOrPlaceholder,
    NullableFiltersOrPlaceholders,
} from "@gooddata/sdk-ui";
import { IBucketChartProps, ICoreChartProps } from "../../interfaces";
import { CoreHeadline } from "./CoreHeadline";
import omit from "lodash/omit";
import invariant from "ts-invariant";

//
// Public interface
//

/**
 * @public
 */
export interface IHeadlineBucketProps {
    /**
     * Specify the measure whose value will be shown as the headline.
     */
    primaryMeasure: MeasureOrPlaceholder;

    /**
     * Optionally specify secondary measure whose value will be shown for comparison with the primary measure.
     * The change in percent between the two values will also be calculated and displayed.
     */
    secondaryMeasure?: MeasureOrPlaceholder;

    /**
     * Optionally specify filters to apply on the data to chart.
     */
    filters?: NullableFiltersOrPlaceholders;

    /**
     * Optional resolution context for composed placeholders.
     */
    placeholdersResolutionContext?: any;
}

/**
 * @public
 */
export interface IHeadlineProps extends IBucketChartProps, IHeadlineBucketProps {}

const WrappedHeadline = withContexts(RenderHeadline);

/**
 * Headline shows a single number or compares two numbers. You can display both measures and attributes.
 *
 * @remarks
 * [Headline](https://sdk.gooddata.com/gooddata-ui/docs/headline_component.html)
 *
 * Headlines have two sections: Measure (primary) and Measure (secondary).
 * You can add one item to each section. If you add two items, the headline also displays the change in percent.
 *
 * See {@link IHeadlineProps} to learn how to configure the Headline.
 *
 * @public
 */
export const Headline = (props: IHeadlineProps) => {
    const [primaryMeasure, secondaryMeasure, filters] = useResolveValuesWithPlaceholders(
        [props.primaryMeasure, props.secondaryMeasure, props.filters],
        props.placeholdersResolutionContext,
    );

    return <WrappedHeadline {...props} {...{ primaryMeasure, secondaryMeasure, filters }} />;
};

export function RenderHeadline(props: IHeadlineProps): JSX.Element {
    invariant(props.primaryMeasure, "The property primaryMeasure must be specified.");
    return <CoreHeadline {...toCoreHeadlineProps(props)} />;
}

//
// Internals
//

type IIrrelevantHeadlineProps = IHeadlineBucketProps & IBucketChartProps;
type IHeadlineNonBucketProps = Subtract<IHeadlineProps, IIrrelevantHeadlineProps>;

export function toCoreHeadlineProps(props: IHeadlineProps): ICoreChartProps {
    const buckets = [
        newBucket(BucketNames.MEASURES, props.primaryMeasure as IMeasure, props.secondaryMeasure as IMeasure),
    ];

    const newProps: IHeadlineNonBucketProps = omit<IHeadlineProps, keyof IIrrelevantHeadlineProps>(props, [
        "primaryMeasure",
        "secondaryMeasure",
        "filters",
        "backend",
    ]);

    return {
        ...newProps,
        execution: createExecution(buckets, props),
        exportTitle: props.exportTitle || "Headline",
    };
}

function createExecution(buckets: IBucket[], props: IHeadlineProps): IPreparedExecution {
    const { backend, workspace, execConfig } = props;

    return backend
        .withTelemetry("Headline", props)
        .workspace(workspace)
        .execution()
        .forBuckets(buckets, props.filters as INullableFilter[])
        .withDimensions(newDimension([MeasureGroupIdentifier]))
        .withExecConfig(execConfig);
}
