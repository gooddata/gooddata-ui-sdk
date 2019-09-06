// (C) 2007-2018 GoodData Corporation
import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { AttributeOrMeasure, IAttribute, IBucket, IFilter, SortItem } from "@gooddata/sdk-model";
import * as React from "react";
import { ATTRIBUTE, MEASURES, STACK } from "../../constants/bucketNames";

import { Subtract } from "../../typings/subtract";
import { stackedChartDimensions } from "../_commons/dimensions";
import { IChartProps, ICommonChartProps } from "../chartProps";
import { CoreLineChart } from "./CoreLineChart";
import omit = require("lodash/omit");

export interface ILineChartBucketProps {
    measures: AttributeOrMeasure[];
    trendBy?: IAttribute;
    segmentBy?: IAttribute;
    filters?: IFilter[];
    sortBy?: SortItem[];
}

export interface ILineChartProps extends ICommonChartProps, ILineChartBucketProps {
    workspace: string;
}

type ILineChartNonBucketProps = Subtract<ILineChartProps, ILineChartBucketProps>;

/**
 * [LineChart](http://sdk.gooddata.com/gooddata-ui/docs/line_chart_component.html)
 * is a component with bucket props measures, trendBy, segmentBy, filters
 */
export function LineChart(props: ILineChartProps): JSX.Element {
    return <CoreLineChart {...toCoreLineChartProps(props)} />;
}

export function toCoreLineChartProps(props: ILineChartProps): IChartProps {
    const buckets: IBucket[] = [
        {
            localIdentifier: MEASURES,
            items: props.measures || [],
        },
        {
            localIdentifier: ATTRIBUTE,
            items: props.trendBy ? [props.trendBy] : [],
        },
        {
            localIdentifier: STACK,
            items: props.segmentBy ? [props.segmentBy] : [],
        },
    ];

    const newProps: ILineChartNonBucketProps = omit<ILineChartProps, keyof ILineChartBucketProps>(props, [
        "measures",
        "trendBy",
        "segmentBy",
        "filters",
        "sortBy",
    ]);

    return {
        ...newProps,
        execution: createExecution(buckets, props),
    };
}

export function createExecution(buckets: IBucket[], props: ILineChartProps): IPreparedExecution {
    const { backend, workspace } = props;

    return backend
        .withTelemetry("Heatmap", props)
        .workspace(workspace)
        .execution()
        .forBuckets(buckets, props.filters)
        .withDimensions(stackedChartDimensions);
}
