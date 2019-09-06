// (C) 2007-2018 GoodData Corporation
import { AttributeOrMeasure, IAttribute, IFilter, SortItem } from "@gooddata/sdk-model";
import * as React from "react";
import { MEASURES, STACK, VIEW } from "../../constants/bucketNames";
import { heatmapDimensions } from "../_commons/dimensions";
import { ICommonChartProps } from "../chartProps";
import { CoreHeatmap } from "./CoreHeatmap";
import { IChartDefinition, getCoreChartProps } from "../_commons/chartDefinition";

export interface IHeatmapBucketProps {
    measure: AttributeOrMeasure;
    rows?: IAttribute;
    columns?: IAttribute;
    filters?: IFilter[];
    sortBy?: SortItem[];
}

export interface IHeatmapProps extends ICommonChartProps, IHeatmapBucketProps {
    workspace: string;
}

const heatmapDefinition: IChartDefinition<IHeatmapBucketProps, IHeatmapProps> = {
    bucketPropsKeys: ["measure", "rows", "columns", "filters", "sortBy"],
    bucketsFactory: props => {
        return [
            {
                localIdentifier: MEASURES,
                items: [props.measure] || [],
            },
            {
                localIdentifier: VIEW,
                items: props.rows ? [props.rows] : [],
            },
            {
                localIdentifier: STACK,
                items: props.columns ? [props.columns] : [],
            },
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace } = props;

        return backend
            .withTelemetry("Heatmap", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters)
            .withDimensions(heatmapDimensions);
    },
};

const getProps = getCoreChartProps(heatmapDefinition);

export function Heatmap(props: IHeatmapProps): JSX.Element {
    return <CoreHeatmap {...getProps(props)} />;
}
