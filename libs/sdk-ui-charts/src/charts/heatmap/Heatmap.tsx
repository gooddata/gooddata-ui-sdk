// (C) 2007-2018 GoodData Corporation
import { IAttributeOrMeasure, IAttribute, IFilter, newBucket, ISortItem } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { heatmapDimensions } from "../_commons/dimensions";
import { IBucketChartProps } from "../../interfaces";
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
    measure: IAttributeOrMeasure;
    rows?: IAttribute;
    columns?: IAttribute;
    filters?: IFilter[];
    sortBy?: ISortItem[];
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
