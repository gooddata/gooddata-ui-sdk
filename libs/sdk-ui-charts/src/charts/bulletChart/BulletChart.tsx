// (C) 2019 GoodData Corporation
import {
    IAttributeOrMeasure,
    IAttribute,
    IFilter,
    newBucket,
    ISortItem,
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
    chartName: "BulletChart",
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
 * @public
 */
export interface IBulletChartBucketProps {
    /**
     * Specify primary measure. This will be charted as the primary bar.
     */
    primaryMeasure: IAttributeOrMeasure;

    /**
     * Optionally specify measure which contains the target/goal value. The value will be charted as the thick
     * line to reach.
     */
    targetMeasure?: IAttributeOrMeasure;

    /**
     * Optionally specify measure to use for comparison. This will be charted as the secondary bar.
     */
    comparativeMeasure?: IAttributeOrMeasure;

    /**
     * Optionally specify one or two attributes to use for slicing the measures.
     *
     * If you specify two attributes, the values of these attributes will appear on the Y axis as grouped. For each
     * value of the first attribute there will be all applicable values of the second attribute. For each value of the
     * second attribute, there will be a bullet.
     */
    viewBy?: IAttribute | IAttribute[];

    /**
     * Optionally specify filters to apply on the data to chart.
     */
    filters?: IFilter[];

    /**
     * Optionally specify how to sort the data to chart.
     */
    sortBy?: ISortItem[];
}

/**
 * @public
 */
export interface IBulletChartProps extends IBulletChartBucketProps, IBucketChartProps {}

/**
 * [BulletChart](http://sdk.gooddata.com/gooddata-ui/docs/bullet_chart_component.html)
 *
 * Bullet chart is a variation of a bar chart that displays performance of a measure (primary measure) and its progress
 * towards a goal (target measure). Optionally, the primary measure can also be compared to another measure (comparative measure).
 *
 * @public
 */
export const BulletChart = withChart(bulletChartDefinition)(CoreBulletChart);
