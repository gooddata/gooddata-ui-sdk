// (C) 2007-2018 GoodData Corporation
import { AttributeOrMeasure, IAttribute, IFilter, newBucket, SortItem } from "@gooddata/sdk-model";
import { BucketNames } from "../../base";
import { heatmapDimensions } from "../_commons/dimensions";
import { IBucketChartProps } from "../chartProps";
import { CoreHeatmap } from "./CoreHeatmap";
import { IChartDefinition } from "../_commons/chartDefinition";
import { withChart } from "../_base/withChart";

//
// Internals
//

const heatmapDefinition: IChartDefinition<IHeatmapBucketProps, IHeatmapProps> = {
    bucketPropsKeys: ["measure", "rows", "columns", "filters", "sortBy"],
    bucketsFactory: props => {
        return [
            newBucket(BucketNames.MEASURES, props.measure),
            newBucket(BucketNames.VIEW, props.rows),
            newBucket(BucketNames.STACK, props.columns),
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
export const Heatmap = withChart(heatmapDefinition)(CoreHeatmap);
