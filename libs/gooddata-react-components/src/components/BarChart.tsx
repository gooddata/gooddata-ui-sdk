// (C) 2019 GoodData Corporation
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
import { ICommonChartProps } from "./exp/props";
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

export interface IBarChartProps extends IBarChartBucketProps, ICommonChartProps {}

type IBarChartNonBucketProps = Subtract<IBarChartProps, IBarChartBucketProps>;

export function BarChart(props: IBarChartProps): JSX.Element {
    const measures = computeRatioRules(props.measures);
    const viewBy = truncate(props.viewBy, VIEW_BY_ATTRIBUTES_LIMIT);
    const stackBy = props.stackBy ? [props.stackBy] : [];

    // @ts-ignore
    const buckets: IBucket[] = [
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

    // TODO: SDK8: can this be done without repeating the prop names?
    const newProps: IBarChartNonBucketProps = omit<IBarChartProps, keyof IBarChartBucketProps>(props, [
        "measures",
        "viewBy",
        "stackBy",
        "filters",
        "sortBy",
    ]);

    const sanitizedConfig = sanitizeConfig2(measures, newProps.config);
    const { backend, workspace } = props;
    const preparedExecution = backend
        .withTelemetry("BarChart", props)
        .workspace(workspace)
        .execution()
        .forBuckets(buckets, props.filters);

    // TODO: SDK8: finish preparation of the execution

    return <CoreBarChart {...newProps} config={sanitizedConfig} execution={preparedExecution} />;
}
