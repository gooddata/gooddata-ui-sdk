// (C) 2007-2018 GoodData Corporation
import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { AttributeOrMeasure, IAttribute, IBucket, IFilter, SortItem } from "@gooddata/sdk-model";
import * as React from "react";
import { MEASURES, VIEW } from "../../constants/bucketNames";

import { Subtract } from "../../typings/subtract";
import { roundChartDimensions } from "../_commons/dimensions";
import { IChartProps, ICommonChartProps } from "../chartProps";
import { CoreFunnelChart } from "./CoreFunnelChart";
import omit = require("lodash/omit");

export interface IFunnelChartBucketProps {
    measures: AttributeOrMeasure[];
    viewBy?: IAttribute;
    filters?: IFilter[];
    sortBy?: SortItem[];
}

export interface IFunnelChartProps extends ICommonChartProps, IFunnelChartBucketProps {
    workspace: string;
}

type IFunnelChartNonBucketProps = Subtract<IFunnelChartProps, IFunnelChartBucketProps>;

/**
 * [FunnelChart](http://sdk.gooddata.com/gdc-ui-sdk-doc/docs/next/pie_chart_component.html)
 * is a component with bucket props measures, viewBy, filters
 */
export function FunnelChart(props: IFunnelChartProps): JSX.Element {
    return <CoreFunnelChart {...toCoreFunnelChartProps(props)} />;
}

export function toCoreFunnelChartProps(props: IFunnelChartProps): IChartProps {
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

    const newProps: IFunnelChartNonBucketProps = omit<IFunnelChartProps, keyof IFunnelChartBucketProps>(
        props,
        ["measures", "viewBy", "filters", "sortBy"],
    );

    return {
        ...newProps,
        execution: createExecution(buckets, props),
    };
}

export function createExecution(buckets: IBucket[], props: IFunnelChartProps): IPreparedExecution {
    const { backend, workspace } = props;

    return backend
        .withTelemetry("FunnelChart", props)
        .workspace(workspace)
        .execution()
        .forBuckets(buckets, props.filters)
        .withDimensions(roundChartDimensions);
}
