// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import omit = require("lodash/omit");
import { VisualizationObject, VisualizationInput } from "@gooddata/typings";

import { Subtract } from "../typings/subtract";
import { BarChart as AfmBarChart } from "./afm/BarChart";
import { ICommonChartProps } from "./core/base/BaseChart";
import { convertBucketsToAFM } from "../helpers/conversion";
import { getStackingResultSpec } from "../helpers/resultSpec";
import { MEASURES, ATTRIBUTE, STACK } from "../constants/bucketNames";
import {
    getViewByTwoAttributes,
    sanitizeConfig,
    sanitizeComputeRatioOnMeasures,
} from "../helpers/optionalStacking/common";

export interface IBarChartBucketProps {
    measures: VisualizationInput.AttributeOrMeasure[];
    viewBy?: VisualizationInput.IAttribute | VisualizationInput.IAttribute[];
    stackBy?: VisualizationInput.IAttribute;
    filters?: VisualizationInput.IFilter[];
    sortBy?: VisualizationInput.ISort[];
}

export interface IBarChartProps extends ICommonChartProps, IBarChartBucketProps {
    projectId: string;
}

type IBarChartNonBucketProps = Subtract<IBarChartProps, IBarChartBucketProps>;

/**
 * [BarChart](http://sdk.gooddata.com/gooddata-ui/docs/bar_chart_component.html)
 * is a component with bucket props measures, viewBy, stackBy, filters
 */
export function BarChart(props: IBarChartProps): JSX.Element {
    const measures = sanitizeComputeRatioOnMeasures(props.measures);
    const viewBy = getViewByTwoAttributes(props.viewBy); // could be one or two attributes
    const stackBy = props.stackBy ? [props.stackBy] : [];

    const buckets: VisualizationObject.IBucket[] = [
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

    const newProps: IBarChartNonBucketProps = omit<IBarChartProps, keyof IBarChartBucketProps>(props, [
        "measures",
        "viewBy",
        "stackBy",
        "filters",
        "sortBy",
    ]);
    const sanitizedConfig = sanitizeConfig(measures, newProps.config);

    return (
        <AfmBarChart
            {...newProps}
            config={sanitizedConfig}
            projectId={props.projectId}
            afm={convertBucketsToAFM(buckets, props.filters)}
            resultSpec={getStackingResultSpec(buckets, props.sortBy)}
        />
    );
}
