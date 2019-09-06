// (C) 2007-2018 GoodData Corporation
import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { IAttribute, IBucket, IFilter, IMeasure, SortItem } from "@gooddata/sdk-model";
import * as React from "react";
import { IChartProps, ICommonChartProps } from "../../components/exp/props";

import { MEASURES, SECONDARY_MEASURES, TERTIARY_MEASURES, VIEW } from "../../constants/bucketNames";
import { Subtract } from "../../typings/subtract";
import { pointyChartDimensions } from "../dimensions";
import { CoreBubbleChart } from "./CoreBubbleChart";
import omit = require("lodash/omit");

export interface IBubbleChartBucketProps {
    xAxisMeasure?: IMeasure;
    yAxisMeasure?: IMeasure;
    size?: IMeasure;
    viewBy?: IAttribute;
    filters?: IFilter[];
    sortBy?: SortItem[];
}

export interface IBubbleChartProps extends ICommonChartProps, IBubbleChartBucketProps {
    projectId: string;
}

type IBubbleChartNonBucketProps = Subtract<IBubbleChartProps, IBubbleChartBucketProps>;

/**
 * [BubbleChart](http://sdk.gooddata.com/gdc-ui-sdk-doc/)
 */
export function BubbleChart(props: IBubbleChartProps): JSX.Element {
    return <CoreBubbleChart {...toCoreBubbleChartProps(props)} />;
}

export function toCoreBubbleChartProps(props: IBubbleChartProps): IChartProps {
    const buckets: IBucket[] = [
        {
            localIdentifier: MEASURES,
            items: props.xAxisMeasure ? [props.xAxisMeasure] : [],
        },
        {
            localIdentifier: SECONDARY_MEASURES,
            items: props.yAxisMeasure ? [props.yAxisMeasure] : [],
        },
        {
            localIdentifier: TERTIARY_MEASURES,
            items: props.size ? [props.size] : [],
        },
        {
            localIdentifier: VIEW,
            items: props.viewBy ? [props.viewBy] : [],
        },
    ];

    const newProps: IBubbleChartNonBucketProps = omit<IBubbleChartProps, keyof IBubbleChartBucketProps>(
        props,
        ["xAxisMeasure", "yAxisMeasure", "size", "viewBy", "filters", "sortBy"],
    );

    return {
        ...newProps,
        execution: createExecution(buckets, props),
    };
}

export function createExecution(buckets: IBucket[], props: IBubbleChartProps): IPreparedExecution {
    const { backend, workspace } = props;

    return backend
        .withTelemetry("AreaChart", props)
        .workspace(workspace)
        .execution()
        .forBuckets(buckets, props.filters)
        .withSorting(...props.sortBy)
        .withDimensions(pointyChartDimensions);
}
