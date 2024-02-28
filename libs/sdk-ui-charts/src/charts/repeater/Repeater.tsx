// (C) 2024 GoodData Corporation

import React from "react";
import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
    IAttribute,
    IAttributeOrMeasure,
    IBucket,
    INullableFilter,
    MeasureGroupIdentifier,
    newBucket,
    newDimension,
} from "@gooddata/sdk-model";
import {
    BucketNames,
    Subtract,
    useResolveValuesWithPlaceholders,
    AttributeOrPlaceholder,
    NullableFiltersOrPlaceholders,
    withContexts,
    AttributesMeasuresOrPlaceholders,
} from "@gooddata/sdk-ui";
import { IBucketChartProps, ICoreChartProps } from "../../interfaces/index.js";
import omit from "lodash/omit.js";
import { CoreRepeater } from "./CoreRepeater.js";

//
// Public interface
//

/**
 * @beta
 */
export interface IRepeaterBucketProps {
    /**
     * Main attribute that sets repeating frequency used for the computation.
     */
    attribute: AttributeOrPlaceholder;

    /**
     * Definition of columns which are sliced by the main attribute.
     */
    columns: AttributesMeasuresOrPlaceholders;

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
export interface IRepeaterProps extends IBucketChartProps, IRepeaterBucketProps {}

const WrappedRepeater = withContexts(RenderRepeater);

/**
 * @beta
 */
export const Repeater = (props: IRepeaterProps): JSX.Element => {
    const [attribute, measures, filters] = useResolveValuesWithPlaceholders(
        [props.attribute, props.columns, props.filters],
        props.placeholdersResolutionContext,
    );

    return <WrappedRepeater {...props} {...{ attribute, measures, filters }} />;
};

export function RenderRepeater(props: IRepeaterProps): JSX.Element {
    return <CoreRepeater {...toCoreRepeaterProps(props)} />;
}

//
// Internals
//

type IIrrelevantRepeaterProps = IRepeaterBucketProps & IBucketChartProps;
type IRepeaterNonBucketProps = Subtract<IRepeaterProps, IIrrelevantRepeaterProps>;

export function toCoreRepeaterProps(props: IRepeaterProps): ICoreChartProps {
    const buckets = [
        newBucket(BucketNames.ATTRIBUTE, props.attribute as IAttribute),
        newBucket(BucketNames.COLUMNS, ...(props.columns as IAttributeOrMeasure[])),
    ];

    const newProps: IRepeaterNonBucketProps = omit<IRepeaterProps, keyof IIrrelevantRepeaterProps>(props, [
        "attribute",
        "columns",
        "filters",
        "backend",
    ]);

    return {
        ...newProps,
        execution: createExecution(buckets, props),
        exportTitle: props.exportTitle || "Repeater",
    };
}

function createExecution(buckets: IBucket[], props: IRepeaterProps): IPreparedExecution {
    const { backend, workspace, execConfig } = props;
    return backend
        .withTelemetry("Repeater", props)
        .workspace(workspace)
        .execution()
        .forBuckets(buckets, props.filters as INullableFilter[])
        .withDimensions(newDimension([props.attribute as IAttribute, MeasureGroupIdentifier])) // TODO: sync this with pluggable vis
        .withExecConfig(execConfig);
}
