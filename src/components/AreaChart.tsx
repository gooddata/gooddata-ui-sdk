// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import omit = require("lodash/omit");
import { VisualizationObject, VisualizationInput } from "@gooddata/typings";

import { Subtract } from "../typings/subtract";
import { AreaChart as AfmAreaChart } from "./afm/AreaChart";

import { ICommonChartProps } from "./core/base/BaseChart";
import { convertBucketsToAFM } from "../helpers/conversion";
import { getStackingResultSpec } from "../helpers/resultSpec";
import { MEASURES, ATTRIBUTE, STACK } from "../constants/bucketNames";
import { verifyBuckets, getBucketsProps, getConfigProps } from "../helpers/optionalStacking/areaChart";
import { sanitizeConfig, sanitizeComputeRatioOnMeasures } from "../helpers/optionalStacking/common";

export interface IAreaChartBucketProps {
    measures: VisualizationInput.AttributeOrMeasure[];
    viewBy?: VisualizationInput.IAttribute | VisualizationInput.IAttribute[];
    stackBy?: VisualizationInput.IAttribute;
    filters?: VisualizationInput.IFilter[];
    sortBy?: VisualizationInput.ISort[];
}

export interface IAreaChartProps extends ICommonChartProps, IAreaChartBucketProps {
    projectId: string;
}

type IAreaChartNonBucketProps = Subtract<IAreaChartProps, IAreaChartBucketProps>;

/**
 * [AreaChart](http://sdk.gooddata.com/gooddata-ui/docs/area_chart_component.html)
 * is a component with bucket props measures, viewBy, stacksBy, filters
 */
export function AreaChart(props: IAreaChartProps): JSX.Element {
    verifyBuckets(props);

    const { measures, viewBy, stackBy } = getBucketsProps(props);
    const sanitizedMeasures = sanitizeComputeRatioOnMeasures(measures);
    const configProp = getConfigProps(props);

    const buckets: VisualizationObject.IBucket[] = [
        {
            localIdentifier: MEASURES,
            items: sanitizedMeasures,
        },
        {
            localIdentifier: ATTRIBUTE,
            items: viewBy,
        },
        {
            localIdentifier: STACK,
            items: stackBy,
        },
    ];

    const newProps: IAreaChartNonBucketProps = omit<IAreaChartProps, keyof IAreaChartBucketProps>(props, [
        "measures",
        "viewBy",
        "stackBy",
        "filters",
        "sortBy",
    ]);
    const sanitizedConfig = sanitizeConfig(measures, {
        ...newProps.config,
        ...configProp,
    });

    return (
        <AfmAreaChart
            {...newProps}
            config={sanitizedConfig}
            projectId={props.projectId}
            afm={convertBucketsToAFM(buckets, props.filters)}
            resultSpec={getStackingResultSpec(buckets, props.sortBy)}
        />
    );
}
