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
import { BucketNames, Subtract, withContexts } from "../../base";
import { ICoreChartProps, IBucketChartProps } from "../chartProps";
import { CoreXirr } from "./CoreXirr";
import omit = require("lodash/omit");

//
// Public interface
//

/**
 * TODO: SDK8: add docs
 *
 * @public
 */
export interface IXirrBucketProps {
    measure: IMeasure;
    attribute?: IAttribute;
    filters?: IFilter[];
}

/**
 * TODO: SDK8: add docs
 *
 * @public
 */
export interface IXirrProps extends IBucketChartProps, IXirrBucketProps {}

/**
 * Xirr
 * is a component with bucket props measure, attribute, filters
 *
 * @public
 */
export const Xirr = withContexts(RenderXirr);

export function RenderXirr(props: IXirrProps): JSX.Element {
    return <CoreXirr {...toCoreXirrProps(props)} />;
}

//
// Internals
//

type IXirrNonBucketProps = Subtract<IXirrProps, IXirrBucketProps>;

export function toCoreXirrProps(props: IXirrProps): ICoreChartProps {
    const buckets = [
        newBucket(BucketNames.MEASURES, props.measure),
        newBucket(BucketNames.ATTRIBUTE, props.attribute),
    ];

    const newProps: IXirrNonBucketProps = omit<IXirrProps, keyof IXirrBucketProps>(props, [
        "measure",
        "attribute",
        "filters",
    ]);

    return {
        ...newProps,
        execution: createExecution(buckets, props),
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
