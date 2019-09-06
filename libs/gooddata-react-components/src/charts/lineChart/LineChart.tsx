// (C) 2007-2018 GoodData Corporation
import { AttributeOrMeasure, IAttribute, IFilter, SortItem } from "@gooddata/sdk-model";
import * as React from "react";
import { ATTRIBUTE, MEASURES, STACK } from "../../constants/bucketNames";

import { stackedChartDimensions } from "../_commons/dimensions";
import { ICommonChartProps } from "../chartProps";
import { CoreLineChart } from "./CoreLineChart";
import { IChartDefinition, getCoreChartProps } from "../_commons/chartDefinition";

export interface ILineChartBucketProps {
    measures: AttributeOrMeasure[];
    trendBy?: IAttribute;
    segmentBy?: IAttribute;
    filters?: IFilter[];
    sortBy?: SortItem[];
}

export interface ILineChartProps extends ICommonChartProps, ILineChartBucketProps {
    workspace: string;
}

const lineChartDefinition: IChartDefinition<ILineChartBucketProps, ILineChartProps> = {
    bucketPropsKeys: ["measures", "trendBy", "segmentBy", "filters", "sortBy"],
    bucketsFactory: props => {
        return [
            {
                localIdentifier: MEASURES,
                items: props.measures || [],
            },
            {
                localIdentifier: ATTRIBUTE,
                items: props.trendBy ? [props.trendBy] : [],
            },
            {
                localIdentifier: STACK,
                items: props.segmentBy ? [props.segmentBy] : [],
            },
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace } = props;

        return backend
            .withTelemetry("LineChart", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters)
            .withDimensions(stackedChartDimensions);
    },
};

const getProps = getCoreChartProps(lineChartDefinition);

/**
 * [LineChart](http://sdk.gooddata.com/gooddata-ui/docs/line_chart_component.html)
 * is a component with bucket props measures, trendBy, segmentBy, filters
 */
export function LineChart(props: ILineChartProps): JSX.Element {
    return <CoreLineChart {...getProps(props)} />;
}
