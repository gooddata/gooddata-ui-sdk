// (C) 2007-2018 GoodData Corporation
import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { AttributeOrMeasure, IAttribute, IBucket, IFilter, SortItem } from "@gooddata/sdk-model";
import * as React from "react";
import { MEASURES, VIEW } from "../../constants/bucketNames";
import { Subtract } from "../../typings/subtract";
import { roundChartDimensions } from "../_commons/dimensions";
import { IChartProps, ICommonChartProps } from "../chartProps";
import { CorePieChart } from "./CorePieChart";
import omit = require("lodash/omit");

export interface IPieChartBucketProps {
    measures: AttributeOrMeasure[];
    viewBy?: IAttribute;
    filters?: IFilter[];
    sortBy?: SortItem[];
}

export interface IPieChartProps extends ICommonChartProps, IPieChartBucketProps {
    projectId: string;
}

type IPieChartNonBucketProps = Subtract<IPieChartProps, IPieChartBucketProps>;

/**
 * [PieChart](http://sdk.gooddata.com/gooddata-ui/docs/pie_chart_component.html)
 * is a component with bucket props measures, viewBy, filters
 */
export function PieChart(props: IPieChartProps): JSX.Element {
    return <CorePieChart {...toCorePieChartProps(props)} />;
}

export function toCorePieChartProps(props: IPieChartProps): IChartProps {
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

    const newProps: IPieChartNonBucketProps = omit<IPieChartProps, keyof IPieChartBucketProps>(props, [
        "measures",
        "viewBy",
        "filters",
        "sortBy",
    ]);

    return {
        ...newProps,
        execution: createExecution(buckets, props),
    };
}

export function createExecution(buckets: IBucket[], props: IPieChartProps): IPreparedExecution {
    const { backend, workspace } = props;

    return backend
        .withTelemetry("Heatmap", props)
        .workspace(workspace)
        .execution()
        .forBuckets(buckets, props.filters)
        .withDimensions(roundChartDimensions);
}
