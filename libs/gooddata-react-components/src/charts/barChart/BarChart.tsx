// (C) 2019 GoodData Corporation
import { AttributeOrMeasure, computeRatioRules, IAttribute, IFilter, SortItem } from "@gooddata/sdk-model";
import * as React from "react";
import { ATTRIBUTE, MEASURES, STACK } from "../../base/constants/bucketNames";
import { ICommonChartProps } from "../chartProps";
import { truncate } from "../_commons/truncate";
import { VIEW_BY_ATTRIBUTES_LIMIT } from "../../highcharts/chart/constants";
import { sanitizeConfig2 } from "../../base/helpers/optionalStacking/common";
import { CoreBarChart } from "./CoreBarChart";
import { stackedChartDimensions } from "../_commons/dimensions";
import { IChartDefinition, getCoreChartProps } from "../_commons/chartDefinition";

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

const barChartDefinition: IChartDefinition<IBarChartBucketProps, IBarChartProps> = {
    bucketPropsKeys: ["measures", "viewBy", "stackBy", "filters", "sortBy"],
    bucketsFactory: props => {
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
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace } = props;

        return backend
            .withTelemetry("BarChart", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters)
            .withSorting(...props.sortBy)
            .withDimensions(stackedChartDimensions);
    },
    propOverridesFactory: (props, buckets) => {
        return {
            config: sanitizeConfig2(buckets, props.config),
        };
    },
};

const getProps = getCoreChartProps(barChartDefinition);

export function BarChart(props: IBarChartProps): JSX.Element {
    return <CoreBarChart {...getProps(props)} />;
}
