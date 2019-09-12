// (C) 2007-2019 GoodData Corporation
import { AttributeOrMeasure, IAttribute, IFilter, SortItem, computeRatioRules } from "@gooddata/sdk-model";
import * as React from "react";
import { truncate } from "../_commons/truncate";
import { VIEW_BY_ATTRIBUTES_LIMIT } from "../../highcharts/chart/constants";
import { ATTRIBUTE, MEASURES, STACK } from "../../base/constants/bucketNames";
import { sanitizeConfig2 } from "../../base/helpers/optionalStacking/common";
import { stackedChartDimensions } from "../_commons/dimensions";
import { ICommonChartProps } from "../chartProps";
import { CoreColumnChart } from "./CoreColumnChart";
import { IChartDefinition, getCoreChartProps } from "../_commons/chartDefinition";

export interface IColumnChartBucketProps {
    measures: AttributeOrMeasure[];
    viewBy?: IAttribute | IAttribute[];
    stackBy?: IAttribute;
    filters?: IFilter[];
    sortBy?: SortItem[];
}

export interface IColumnChartProps extends ICommonChartProps, IColumnChartBucketProps {
    workspace: string;
}

const columnChartDefinition: IChartDefinition<IColumnChartBucketProps, IColumnChartProps> = {
    bucketPropsKeys: ["measures", "viewBy", "stackBy", "filters", "sortBy"],
    bucketsFactory: props => {
        const measures = computeRatioRules(props.measures);
        const viewBy = truncate(props.viewBy, VIEW_BY_ATTRIBUTES_LIMIT); // could be one or two attributes
        const stackBy = props.stackBy ? [props.stackBy] : [];

        return [
            {
                localIdentifier: MEASURES,
                items: measures,
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
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace } = props;

        return backend
            .withTelemetry("ColumnChart", props)
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

const getProps = getCoreChartProps(columnChartDefinition);

/**
 * [ColumnChart](http://sdk.gooddata.com/gooddata-ui/docs/column_chart_component.html)
 * is a component with bucket props measures, viewBy, stackBy, filters
 */
export function ColumnChart(props: IColumnChartProps): JSX.Element {
    return <CoreColumnChart {...getProps(props)} />;
}
