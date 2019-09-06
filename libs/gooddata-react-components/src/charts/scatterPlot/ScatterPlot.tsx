// (C) 2007-2018 GoodData Corporation
import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { IAttribute, IBucket, IFilter, IMeasure, SortItem } from "@gooddata/sdk-model";
import * as React from "react";
import { ATTRIBUTE, MEASURES, SECONDARY_MEASURES } from "../../constants/bucketNames";

import { Subtract } from "../../typings/subtract";
import { pointyChartDimensions } from "../_commons/dimensions";
import { IChartProps, ICommonChartProps } from "../chartProps";
import { CoreScatterPlot } from "./CoreScatterPlot";
import omit = require("lodash/omit");

export interface IScatterPlotBucketProps {
    xAxisMeasure?: IMeasure;
    yAxisMeasure?: IMeasure;
    attribute?: IAttribute;
    filters?: IFilter[];
    sortBy?: SortItem[]; // TODO would it be removed? if not dont forget to test
}

export interface IScatterPlotProps extends ICommonChartProps, IScatterPlotBucketProps {
    projectId: string;
}

type IScatterPlotNonBucketProps = Subtract<IScatterPlotProps, IScatterPlotBucketProps>;

/**
 * [ScatterPlot](http://sdk.gooddata.com/gooddata-ui/docs/scatter_plot_component.html)
 * is a component with bucket props xAxisMeasure, yAxisMeasure, attribute, filters
 */
export function ScatterPlot(props: IScatterPlotProps): JSX.Element {
    return <CoreScatterPlot {...toCoreScatterPlotProps(props)} />;
}

export function toCoreScatterPlotProps(props: IScatterPlotProps): IChartProps {
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
            localIdentifier: ATTRIBUTE,
            items: props.attribute ? [props.attribute] : [],
        },
    ];

    const newProps: IScatterPlotNonBucketProps = omit<IScatterPlotProps, keyof IScatterPlotBucketProps>(
        props,
        ["xAxisMeasure", "yAxisMeasure", "attribute", "filters", "sortBy"],
    );

    return {
        ...newProps,
        execution: createExecution(buckets, props),
    };
}

export function createExecution(buckets: IBucket[], props: IScatterPlotProps): IPreparedExecution {
    const { backend, workspace } = props;

    return backend
        .withTelemetry("ScatterPlot", props)
        .workspace(workspace)
        .execution()
        .forBuckets(buckets, props.filters)
        .withDimensions(pointyChartDimensions);
}
