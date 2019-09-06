// (C) 2007-2018 GoodData Corporation
import { AttributeOrMeasure, IAttribute, IFilter, SortItem } from "@gooddata/sdk-model";
import * as React from "react";
import { MEASURES, VIEW } from "../../constants/bucketNames";
import { roundChartDimensions } from "../_commons/dimensions";
import { ICommonChartProps } from "../chartProps";
import { CorePieChart } from "./CorePieChart";
import { IChartDefinition, getCoreChartProps } from "../_commons/chartDefinition";

export interface IPieChartBucketProps {
    measures: AttributeOrMeasure[];
    viewBy?: IAttribute;
    filters?: IFilter[];
    sortBy?: SortItem[];
}

export interface IPieChartProps extends ICommonChartProps, IPieChartBucketProps {
    projectId: string;
}

const pieChartDefinition: IChartDefinition<IPieChartBucketProps, IPieChartProps> = {
    bucketPropsKeys: ["measures", "viewBy", "filters", "sortBy"],
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
            .withTelemetry("PieChart", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters)
            .withDimensions(roundChartDimensions);
    },
};

const getProps = getCoreChartProps(pieChartDefinition);

/**
 * [PieChart](http://sdk.gooddata.com/gooddata-ui/docs/pie_chart_component.html)
 * is a component with bucket props measures, viewBy, filters
 */
export function PieChart(props: IPieChartProps): JSX.Element {
    return <CorePieChart {...getProps(props)} />;
}
