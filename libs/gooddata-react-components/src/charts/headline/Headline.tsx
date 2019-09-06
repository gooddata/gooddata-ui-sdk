// (C) 2007-2018 GoodData Corporation
import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { IBucket, IFilter, IMeasure } from "@gooddata/sdk-model";
import * as React from "react";
import { MEASURES } from "../../constants/bucketNames";

import { Subtract } from "../../typings/subtract";
import { IChartProps, ICommonChartProps } from "../chartProps";
import { CoreHeadline } from "./CoreHeadline";
import omit = require("lodash/omit");

export interface IHeadlineBucketProps {
    primaryMeasure: IMeasure;
    secondaryMeasure?: IMeasure;
    filters?: IFilter[];
}

export interface IHeadlineProps extends ICommonChartProps, IHeadlineBucketProps {
    workspace: string;
}

type IHeadlineNonBucketProps = Subtract<IHeadlineProps, IHeadlineBucketProps>;

/**
 * Headline
 * is a component with bucket props primaryMeasure, secondaryMeasure, filters
 */
export function Headline(props: IHeadlineProps): JSX.Element {
    return <CoreHeadline {...toCoreHeadlineProps(props)} />;
}

export function toCoreHeadlineProps(props: IHeadlineProps): IChartProps {
    const buckets = [
        {
            localIdentifier: MEASURES,
            items: props.secondaryMeasure
                ? [props.primaryMeasure, props.secondaryMeasure]
                : [props.primaryMeasure],
        },
    ];

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
        .withTelemetry("FunnelChart", props)
        .workspace(workspace)
        .execution()
        .forBuckets(buckets, props.filters)
        .withDimensions({ itemIdentifiers: ["measureGroup"] });
}
