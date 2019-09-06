// (C) 2007-2019 GoodData Corporation
import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
    AttributeOrMeasure,
    IAttribute,
    IBucket,
    IFilter,
    SortItem,
    computeRatioRules,
} from "@gooddata/sdk-model";
import * as React from "react";
import { truncate } from "../../components/exp/chartUtils";
import { VIEW_BY_ATTRIBUTES_LIMIT } from "../../components/visualizations/chart/constants";
import { ATTRIBUTE, MEASURES, STACK } from "../../constants/bucketNames";
import { sanitizeConfig2 } from "../../helpers/optionalStacking/common";
import { Subtract } from "../../typings/subtract";
import { stackedChartDimensions } from "../_commons/dimensions";
import { IChartProps, ICommonChartProps } from "../chartProps";
import { CoreColumnChart } from "./CoreColumnChart";
import omit = require("lodash/omit");

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

type IColumnChartNonBucketProps = Subtract<IColumnChartProps, IColumnChartBucketProps>;

/**
 * [ColumnChart](http://sdk.gooddata.com/gooddata-ui/docs/column_chart_component.html)
 * is a component with bucket props measures, viewBy, stackBy, filters
 */
export function ColumnChart(props: IColumnChartProps): JSX.Element {
    return <CoreColumnChart {...toCoreColumnChartProps(props)} />;
}

export function toCoreColumnChartProps(props: IColumnChartProps): IChartProps {
    const measures = computeRatioRules(props.measures);
    const viewBy = truncate(props.viewBy, VIEW_BY_ATTRIBUTES_LIMIT); // could be one or two attributes
    const stackBy = props.stackBy ? [props.stackBy] : [];

    const buckets: IBucket[] = [
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

    const newProps: IColumnChartNonBucketProps = omit<IColumnChartProps, keyof IColumnChartBucketProps>(
        props,
        ["measures", "viewBy", "stackBy", "filters", "sortBy"],
    );
    return {
        ...newProps,
        config: sanitizeConfig2(buckets, newProps.config),
        execution: createExecution(buckets, props),
    };
}

export function createExecution(buckets: IBucket[], props: IColumnChartProps): IPreparedExecution {
    const { backend, workspace } = props;

    return backend
        .withTelemetry("ColumnChart", props)
        .workspace(workspace)
        .execution()
        .forBuckets(buckets, props.filters)
        .withSorting(...props.sortBy)
        .withDimensions(stackedChartDimensions);
}
