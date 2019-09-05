// (C) 2019 GoodData Corporation
import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
/* tslint:disable */
import {
    AttributeOrMeasure,
    computeRatioRules,
    IAttribute,
    IBucket,
    IFilter,
    SortItem,
} from "@gooddata/sdk-model";
import * as React from "react";
import { ATTRIBUTE, MEASURES, STACK } from "../constants/bucketNames";
import omit = require("lodash/omit");
import { IChartProps, ICommonChartProps } from "./exp/props";
import { Subtract } from "../typings/subtract";
import { truncate } from "./exp/chartUtils";
import { VIEW_BY_ATTRIBUTES_LIMIT } from "./visualizations/chart/constants";
import { sanitizeConfig2 } from "../helpers/optionalStacking/common";
import { BarChart as CoreBarChart } from "./core/BarChart";

export interface IBarChartBucketProps {
    measures: AttributeOrMeasure[];
    viewBy?: IAttribute | IAttribute[];
    stackBy?: IAttribute;
    filters?: IFilter[];
    sortBy?: SortItem[];
}

export interface IBarChartProps extends IBarChartBucketProps, ICommonChartProps {
    workspace: string;
}

type IBarChartNonBucketProps = Subtract<IBarChartProps, IBarChartBucketProps>;

export function BarChart(props: IBarChartProps): JSX.Element {
    return <CoreBarChart {...toCoreBarChartProps(props)} />;
}

export function toBuckets(props: IBarChartBucketProps): IBucket[] {
    const measures = computeRatioRules(props.measures);
    const viewBy = truncate(props.viewBy, VIEW_BY_ATTRIBUTES_LIMIT);
    const stackBy = props.stackBy ? [props.stackBy] : [];

    return [
        {
            localIdentifier: MEASURES,
            items: measures,
        },
        {
            localIdentifier: ATTRIBUTE,
            items: viewBy, // could be one or two attributes
        },
        {
            localIdentifier: STACK,
            items: stackBy,
        },
    ];
}

export function createExecution(buckets: IBucket[], props: IBarChartProps): IPreparedExecution {
    const { backend, workspace } = props;

    // TODO: SDK8: finish preparation of the execution.. sorts & dims
    return backend
        .withTelemetry("BarChart", props)
        .workspace(workspace)
        .execution()
        .forBuckets(buckets, props.filters);
}

export function toCoreBarChartProps(props: IBarChartProps): IChartProps {
    const buckets = toBuckets(props);

    // TODO: SDK8: can this be done without repeating the prop names?
    const newProps: IBarChartNonBucketProps = omit<IBarChartProps, keyof IBarChartBucketProps>(props, [
        "measures",
        "viewBy",
        "stackBy",
        "filters",
        "sortBy",
    ]);

    return {
        ...newProps,
        config: sanitizeConfig2(buckets, props.config),
        execution: createExecution(buckets, props),
    };
}
