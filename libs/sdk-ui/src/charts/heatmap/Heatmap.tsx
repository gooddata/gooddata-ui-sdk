// (C) 2007-2018 GoodData Corporation
import { AttributeOrMeasure, IAttribute, IFilter, newBucket, SortItem } from "@gooddata/sdk-model";
import * as React from "react";
import { MEASURES, STACK, VIEW } from "../../base/constants/bucketNames";
import { heatmapDimensions } from "../_commons/dimensions";
import { IBucketChartProps } from "../chartProps";
import { CoreHeatmap } from "./CoreHeatmap";
import { getCoreChartProps, IChartDefinition } from "../_commons/chartDefinition";

//
// Public interface
//

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IHeatmapBucketProps {
    measure: AttributeOrMeasure;
    rows?: IAttribute;
    columns?: IAttribute;
    filters?: IFilter[];
    sortBy?: SortItem[];
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IHeatmapProps extends IBucketChartProps, IHeatmapBucketProps {}

/**
 * TODO: SDK8: add docs
 * @public
 */
export function Heatmap(props: IHeatmapProps): JSX.Element {
    return <CoreHeatmap {...getProps(props)} />;
}

//
// Internals
//

const heatmapDefinition: IChartDefinition<IHeatmapBucketProps, IHeatmapProps> = {
    bucketPropsKeys: ["measure", "rows", "columns", "filters", "sortBy"],
    bucketsFactory: props => {
        return [
            newBucket(MEASURES, props.measure),
            newBucket(VIEW, props.rows),
            newBucket(STACK, props.columns),
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
