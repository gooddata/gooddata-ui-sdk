// (C) 2007-2018 GoodData Corporation
import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { AttributeOrMeasure, IAttribute, IBucket, IFilter } from "@gooddata/sdk-model";
import * as React from "react";
import { MEASURES, VIEW } from "../../constants/bucketNames";

import { Subtract } from "../../typings/subtract";
import { roundChartDimensions } from "../_commons/dimensions";
import { IChartProps, ICommonChartProps } from "../chartProps";
import { CoreDonutChart } from "./CoreDonutChart";
import omit = require("lodash/omit");

export interface IDonutChartBucketProps {
    measures: AttributeOrMeasure[];
    viewBy?: IAttribute;
    filters?: IFilter[];
}

export interface IDonutChartProps extends ICommonChartProps, IDonutChartBucketProps {
    projectId: string;
}

type IDonutChartNonBucketProps = Subtract<IDonutChartProps, IDonutChartBucketProps>;

/**
 * [DonutChart](http://sdk.gooddata.com/gooddata-ui/docs/donut_chart_component.html)
 * is a component with bucket props measures, viewBy, filters
 */
export function DonutChart(props: IDonutChartProps): JSX.Element {
    return <CoreDonutChart {...toCoreDonutChartProps(props)} />;
}

export function toCoreDonutChartProps(props: IDonutChartProps): IChartProps {
    const buckets: IBucket[] = [
        {
            localIdentifier: MEASURES,
            items: props.measures || [],
        },
        {
            localIdentifier: VIEW,
            items: props.viewBy ? [props.viewBy] : [],
        },
    ];

    const newProps: IDonutChartNonBucketProps = omit<IDonutChartProps, keyof IDonutChartBucketProps>(props, [
        "measures",
        "viewBy",
        "filters",
    ]);

    return {
        ...newProps,
        execution: createExecution(buckets, props),
    };
}

export function createExecution(buckets: IBucket[], props: IDonutChartProps): IPreparedExecution {
    const { backend, workspace } = props;

    return backend
        .withTelemetry("DonutChart", props)
        .workspace(workspace)
        .execution()
        .forBuckets(buckets, props.filters)
        .withDimensions(roundChartDimensions);
}
