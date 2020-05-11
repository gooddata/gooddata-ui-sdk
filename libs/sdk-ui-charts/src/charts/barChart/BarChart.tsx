// (C) 2019 GoodData Corporation
import {
    IAttributeOrMeasure,
    applyRatioRule,
    IAttribute,
    IFilter,
    newBucket,
    ISortItem,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { IBucketChartProps, ViewByAttributesLimit } from "../../interfaces";
import { truncate } from "../_commons/truncate";
import { CoreBarChart } from "./CoreBarChart";
import { stackedChartDimensions } from "../_commons/dimensions";
import { IChartDefinition } from "../_commons/chartDefinition";
import { withChart } from "../_base/withChart";
import { sanitizeConfig } from "../_commons/sanitizeStacking";

//
// Internals
//

const barChartDefinition: IChartDefinition<IBarChartBucketProps, IBarChartProps> = {
    bucketPropsKeys: ["measures", "viewBy", "stackBy", "filters", "sortBy"],
    bucketsFactory: props => {
        const measures = applyRatioRule(props.measures);
        const viewBy = truncate(props.viewBy, ViewByAttributesLimit);

        return [
            newBucket(BucketNames.MEASURES, ...measures),
            newBucket(BucketNames.VIEW, ...viewBy),
            newBucket(BucketNames.STACK, props.stackBy),
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
            config: sanitizeConfig(buckets, props.config),
        };
    },
};

//
// Public interface
//

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IBarChartBucketProps {
    measures: IAttributeOrMeasure[];
    viewBy?: IAttribute | IAttribute[];
    stackBy?: IAttribute;
    filters?: IFilter[];
    sortBy?: ISortItem[];
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IBarChartProps extends IBarChartBucketProps, IBucketChartProps {}

/**
 * TODO: SDK8: add docs
 * @public
 */
export const BarChart = withChart(barChartDefinition)(CoreBarChart);
