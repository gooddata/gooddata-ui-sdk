// (C) 2007-2018 GoodData Corporation
import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { IBucket, IFilter, IMeasure, newBucket } from "@gooddata/sdk-model";
import * as React from "react";
import { BucketNames, withContexts, Subtract } from "@gooddata/sdk-ui";
import { ICoreChartProps, IBucketChartProps } from "../chartProps";
import { CoreHeadline } from "./CoreHeadline";
import omit = require("lodash/omit");

//
// Public interface
//

/**
 * TODO: SDK8: add docs
 *
 * @public
 */
export interface IHeadlineBucketProps {
    primaryMeasure: IMeasure;
    secondaryMeasure?: IMeasure;
    filters?: IFilter[];
}

/**
 * TODO: SDK8: add docs
 *
 * @public
 */
export interface IHeadlineProps extends IBucketChartProps, IHeadlineBucketProps {}

/**
 * Headline
 * is a component with bucket props primaryMeasure, secondaryMeasure, filters
 *
 * @public
 */
export const Headline = withContexts(RenderHeadline);

export function RenderHeadline(props: IHeadlineProps): JSX.Element {
    return <CoreHeadline {...toCoreHeadlineProps(props)} />;
}

//
// Internals
//

type IHeadlineNonBucketProps = Subtract<IHeadlineProps, IHeadlineBucketProps>;

export function toCoreHeadlineProps(props: IHeadlineProps): ICoreChartProps {
    const buckets = [newBucket(BucketNames.MEASURES, props.primaryMeasure, props.secondaryMeasure)];

    const newProps: IHeadlineNonBucketProps = omit<IHeadlineProps, keyof IHeadlineBucketProps>(props, [
        "primaryMeasure",
        "secondaryMeasure",
        "filters",
    ]);

    return {
        ...newProps,
        execution: createExecution(buckets, props),
    };
}

function createExecution(buckets: IBucket[], props: IHeadlineProps): IPreparedExecution {
    const { backend, workspace } = props;

    return backend
        .withTelemetry("Headline", props)
        .workspace(workspace)
        .execution()
        .forBuckets(buckets, props.filters)
        .withDimensions({ itemIdentifiers: ["measureGroup"] });
}
