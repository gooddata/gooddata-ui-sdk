// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
    IBucket,
    IFilter,
    IMeasure,
    newBucket,
    IAttribute,
    attributeLocalId,
    newDimension,
    bucketsAttributes,
} from "@gooddata/sdk-model";
import { BucketNames, Subtract, withContexts } from "@gooddata/sdk-ui";
import { ICoreChartProps, IBucketChartProps } from "../../interfaces";
import { CoreXirr } from "./CoreXirr";
import omit = require("lodash/omit");

//
// Public interface
//

/**
 * @beta
 */
export interface IXirrBucketProps {
    /**
     * The measure to calculate the Internal Rate of Return for.
     * For the result to make sense, the measure should start with a negative value at some point in time (the investment) followed by other values (the returns).
     */
    measure: IMeasure;
    /**
     * The date dimension to use for the computation. This allows you to set the granularity (day, month, etc.) for the IRR calculation.
     */
    attribute?: IAttribute;
    /**
     * Optionally specify filters to apply on the data to compute with.
     */
    filters?: IFilter[];
}

/**
 * @beta
 */
export interface IXirrProps extends IBucketChartProps, IXirrBucketProps {}

/**
 * Xirr computes the [Internal Rate of Return](https://en.wikipedia.org/wiki/Internal_rate_of_return) from the given measure and date dimension.
 * The "X" in the name means that the returns do not have to happen periodically (as in the standard IRR), but they can [happen at any day](https://en.wikipedia.org/wiki/Internal_rate_of_return#Exact_dates_of_cash_flows).
 * You must specify both the measure and date dimension.
 *
 * @beta
 */
export const Xirr = withContexts(RenderXirr);

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
        newBucket(BucketNames.MEASURES, props.measure),
        newBucket(BucketNames.ATTRIBUTE, props.attribute),
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
    const { backend, workspace } = props;

    return backend
        .withTelemetry("Xirr", props)
        .workspace(workspace)
        .execution()
        .forBuckets(buckets, props.filters)
        .withDimensions(
            newDimension([
                "measureGroup",
                ...bucketsAttributes(buckets).map(attribute => attributeLocalId(attribute)),
            ]),
        );
}
