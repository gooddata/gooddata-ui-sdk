// (C) 2007-2018 GoodData Corporation
import { AttributeOrMeasure, IAttribute, IBucket, IFilter, SortItem } from "@gooddata/sdk-model";
import * as React from "react";
import { MEASURES, STACK, VIEW } from "../../constants/bucketNames";

import { Subtract } from "../../typings/subtract";
import { heatmapDimensions } from "../_commons/dimensions";
import { IChartProps, ICommonChartProps } from "../chartProps";
import { CoreHeatmap } from "./CoreHeatmap";
import omit = require("lodash/omit");

export interface IHeatmapBucketProps {
    measure: AttributeOrMeasure;
    rows?: IAttribute;
    columns?: IAttribute;
    filters?: IFilter[];
    sortBy?: SortItem[];
}

export interface IHeatmapProps extends ICommonChartProps, IHeatmapBucketProps {
    workspace: string;
}

type IHeatmapNonBucketProps = Subtract<IHeatmapProps, IHeatmapBucketProps>;

export function Heatmap(props: IHeatmapProps): JSX.Element {
    return <CoreHeatmap {...toCoreHeatmapProps(props)} />;
}

export function toCoreHeatmapProps(props: IHeatmapProps): IChartProps {
    const buckets: IBucket[] = [
        {
            localIdentifier: MEASURES,
            items: [props.measure] || [],
        },
        {
            localIdentifier: VIEW,
            items: props.rows ? [props.rows] : [],
        },
        {
            localIdentifier: STACK,
            items: props.columns ? [props.columns] : [],
        },
    ];

    const newProps: IHeatmapNonBucketProps = omit<IHeatmapProps, keyof IHeatmapBucketProps>(props, [
        "measure",
        "rows",
        "columns",
        "filters",
        "sortBy",
    ]);

    return {
        ...newProps,
        execution: createExecution(buckets, props),
    };
}

export function createExecution(buckets: IBucket[], props: IHeatmapProps) {
    const { backend, workspace } = props;

    return backend
        .withTelemetry("Heatmap", props)
        .workspace(workspace)
        .execution()
        .forBuckets(buckets, props.filters)
        .withDimensions(heatmapDimensions);
}
