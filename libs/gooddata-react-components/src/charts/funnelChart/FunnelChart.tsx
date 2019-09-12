// (C) 2007-2018 GoodData Corporation
import { AttributeOrMeasure, IAttribute, IFilter, SortItem } from "@gooddata/sdk-model";
import * as React from "react";
import { MEASURES, VIEW } from "../../base/constants/bucketNames";
import { roundChartDimensions } from "../_commons/dimensions";
import { ICommonChartProps } from "../chartProps";
import { CoreFunnelChart } from "./CoreFunnelChart";
import { IChartDefinition, getCoreChartProps } from "../_commons/chartDefinition";

export interface IFunnelChartBucketProps {
    measures: AttributeOrMeasure[];
    viewBy?: IAttribute;
    filters?: IFilter[];
    sortBy?: SortItem[];
}

export interface IFunnelChartProps extends ICommonChartProps, IFunnelChartBucketProps {
    workspace: string;
}

const funnelChartDefinition: IChartDefinition<IFunnelChartBucketProps, IFunnelChartProps> = {
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
            .withTelemetry("FunnelChart", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters)
            .withDimensions(roundChartDimensions);
    },
};

const getProps = getCoreChartProps(funnelChartDefinition);

/**
 * [FunnelChart](http://sdk.gooddata.com/gdc-ui-sdk-doc/docs/next/pie_chart_component.html)
 * is a component with bucket props measures, viewBy, filters
 */
export function FunnelChart(props: IFunnelChartProps): JSX.Element {
    return <CoreFunnelChart {...getProps(props)} />;
}
