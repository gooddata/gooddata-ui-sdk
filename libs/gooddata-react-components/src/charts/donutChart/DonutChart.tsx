// (C) 2007-2018 GoodData Corporation
import { AttributeOrMeasure, IAttribute, IFilter } from "@gooddata/sdk-model";
import * as React from "react";
import { MEASURES, VIEW } from "../../base/constants/bucketNames";
import { roundChartDimensions } from "../_commons/dimensions";
import { ICommonChartProps } from "../chartProps";
import { CoreDonutChart } from "./CoreDonutChart";
import { IChartDefinition, getCoreChartProps } from "../_commons/chartDefinition";

export interface IDonutChartBucketProps {
    measures: AttributeOrMeasure[];
    viewBy?: IAttribute;
    filters?: IFilter[];
}

export interface IDonutChartProps extends ICommonChartProps, IDonutChartBucketProps {
    workspace: string;
}

const donutChartDefinition: IChartDefinition<IDonutChartBucketProps, IDonutChartProps> = {
    bucketPropsKeys: ["measures", "viewBy", "filters"],
    bucketsFactory: props => {
        return [
            {
                localIdentifier: MEASURES,
                items: props.measures || [],
            },
            {
                localIdentifier: VIEW,
                items: props.viewBy ? [props.viewBy] : [],
            },
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace } = props;

        return backend
            .withTelemetry("DonutChart", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters)
            .withDimensions(roundChartDimensions);
    },
};

const getProps = getCoreChartProps(donutChartDefinition);

/**
 * [DonutChart](http://sdk.gooddata.com/gooddata-ui/docs/donut_chart_component.html)
 * is a component with bucket props measures, viewBy, filters
 */
export function DonutChart(props: IDonutChartProps): JSX.Element {
    return <CoreDonutChart {...getProps(props)} />;
}
