// (C) 2019 GoodData Corporation
import {
    AttributeOrMeasure,
    IAttribute,
    IFilter,
    newBucket,
    SortItem,
    disableComputeRatio,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { IBucketChartProps, ViewByAttributesLimit } from "../../interfaces";
import { truncate } from "../_commons/truncate";
import { CoreBulletChart } from "./CoreBulletChart";
import { stackedChartDimensions } from "../_commons/dimensions";
import { IChartDefinition } from "../_commons/chartDefinition";
import { withChart } from "../_base/withChart";
import { sanitizeConfig } from "../_commons/sanitizeStacking";

//
// Internals
//

const bulletChartDefinition: IChartDefinition<IBulletChartBucketProps, IBulletChartProps> = {
    bucketPropsKeys: ["primaryMeasure", "targetMeasure", "comparativeMeasure", "viewBy", "filters", "sortBy"],
    propTransformation: props => {
        /*
         * Modify input props - disable compute ratio on all measures
         */
        return {
            ...props,
            primaryMeasure: disableComputeRatio(props.primaryMeasure),
            targetMeasure: props.targetMeasure ? disableComputeRatio(props.targetMeasure) : undefined,
            comparativeMeasure: props.comparativeMeasure
                ? disableComputeRatio(props.comparativeMeasure)
                : undefined,
        };
    },
    bucketsFactory: props => {
        const viewBy = truncate(props.viewBy, ViewByAttributesLimit);

        return [
            newBucket(BucketNames.MEASURES, props.primaryMeasure),
            newBucket(BucketNames.SECONDARY_MEASURES, props.targetMeasure),
            newBucket(BucketNames.TERTIARY_MEASURES, props.comparativeMeasure),
            newBucket(BucketNames.VIEW, ...viewBy),
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace } = props;

        return backend
            .withTelemetry("BulletChart", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters)
            .withSorting(...props.sortBy)
            .withDimensions(stackedChartDimensions);
    },
    propOverridesFactory: (props, _buckets) => {
        return {
            config: sanitizeConfig(
                [props.primaryMeasure, props.targetMeasure, props.comparativeMeasure],
                props.config,
            ),
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
export interface IBulletChartBucketProps {
    primaryMeasure: AttributeOrMeasure;
    targetMeasure?: AttributeOrMeasure;
    comparativeMeasure?: AttributeOrMeasure;
    viewBy?: IAttribute[];
    filters?: IFilter[];
    sortBy?: SortItem[];
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IBulletChartProps extends IBulletChartBucketProps, IBucketChartProps {}

/**
 * [BulletChart](http://sdk.gooddata.com/gooddata-ui/docs/bullet_chart_component.html)
 *
 * @public
 */
export const BulletChart = withChart(bulletChartDefinition)(CoreBulletChart);
