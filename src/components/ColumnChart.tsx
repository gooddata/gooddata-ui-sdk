// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import omit = require("lodash/omit");
import { VisualizationInput, VisualizationObject } from "@gooddata/typings";

import { Subtract } from "../typings/subtract";
import { ColumnChart as AfmColumnChart } from "./afm/ColumnChart";
import { ICommonChartProps } from "./core/base/BaseChart";
import { convertBucketsToAFM } from "../helpers/conversion";
import { getStackingResultSpec } from "../helpers/resultSpec";
import { MEASURES, ATTRIBUTE, STACK } from "../constants/bucketNames";
import {
    getSanitizedBucketsAndStackingConfig,
    getViewByTwoAttributes,
    ISanitizedBucketsAndStackingConfig,
} from "../helpers/optionalStacking/common";

export interface IColumnChartBucketProps {
    measures: VisualizationInput.AttributeOrMeasure[];
    viewBy?: VisualizationInput.IAttribute | VisualizationInput.IAttribute[];
    stackBy?: VisualizationInput.IAttribute;
    filters?: VisualizationInput.IFilter[];
    sortBy?: VisualizationInput.ISort[];
}

export interface IColumnChartProps extends ICommonChartProps, IColumnChartBucketProps {
    projectId: string;
}

type IColumnChartNonBucketProps = Subtract<IColumnChartProps, IColumnChartBucketProps>;

/**
 * [ColumnChart](http://sdk.gooddata.com/gooddata-ui/docs/column_chart_component.html)
 * is a component with bucket props measures, viewBy, stackBy, filters
 */
export function ColumnChart(props: IColumnChartProps): JSX.Element {
    const buckets: VisualizationObject.IBucket[] = [
        {
            localIdentifier: MEASURES,
            items: props.measures || [],
        },
        {
            localIdentifier: ATTRIBUTE,
            items: getViewByTwoAttributes(props.viewBy), // could be one or two attributes
        },
        {
            localIdentifier: STACK,
            items: props.stackBy ? [props.stackBy] : [],
        },
    ];

    const newProps: IColumnChartNonBucketProps = omit<IColumnChartProps, keyof IColumnChartBucketProps>(
        props,
        ["measures", "viewBy", "stackBy", "filters", "sortBy"],
    );

    const {
        buckets: sanitizedBuckets,
        config: sanitizedConfig,
    }: ISanitizedBucketsAndStackingConfig = getSanitizedBucketsAndStackingConfig(buckets, newProps.config);

    return (
        <AfmColumnChart
            {...newProps}
            config={sanitizedConfig}
            projectId={props.projectId}
            afm={convertBucketsToAFM(sanitizedBuckets, props.filters)}
            resultSpec={getStackingResultSpec(sanitizedBuckets, props.sortBy)}
        />
    );
}
