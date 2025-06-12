// (C) 2019-2023 GoodData Corporation
import React from "react";
import {
    disableComputeRatio,
    IAttribute,
    IAttributeOrMeasure,
    INullableFilter,
    ISortItem,
    newBucket,
} from "@gooddata/sdk-model";
import {
    BucketNames,
    useResolveValuesWithPlaceholders,
    SortsOrPlaceholders,
    AttributeMeasureOrPlaceholder,
    AttributeOrPlaceholder,
    AttributesOrPlaceholders,
    NullableFiltersOrPlaceholders,
} from "@gooddata/sdk-ui";
import { IBucketChartProps, ViewByAttributesLimit } from "../../interfaces/index.js";
import { truncate } from "../_commons/truncate.js";
import { CoreBulletChart } from "./CoreBulletChart.js";
import { stackedChartDimensions } from "../_commons/dimensions.js";
import { IChartDefinition } from "../_commons/chartDefinition.js";
import { withChart } from "../_base/withChart.js";
import { sanitizeConfig } from "../_commons/sanitizeStacking.js";

//
// Internals
//

const bulletChartDefinition: IChartDefinition<IBulletChartBucketProps, IBulletChartProps> = {
    chartName: "BulletChart",
    bucketPropsKeys: ["primaryMeasure", "targetMeasure", "comparativeMeasure", "viewBy", "filters", "sortBy"],
    propTransformation: (props) => {
        /*
         * Modify input props - disable compute ratio on all measures
         */
        return {
            ...props,
            primaryMeasure: disableComputeRatio(props.primaryMeasure as IAttributeOrMeasure),
            targetMeasure: props.targetMeasure
                ? disableComputeRatio(props.targetMeasure as IAttributeOrMeasure)
                : undefined,
            comparativeMeasure: props.comparativeMeasure
                ? disableComputeRatio(props.comparativeMeasure as IAttributeOrMeasure)
                : undefined,
        };
    },
    bucketsFactory: (props) => {
        const viewBy = truncate(props.viewBy, ViewByAttributesLimit);

        return [
            newBucket(BucketNames.MEASURES, props.primaryMeasure as IAttributeOrMeasure),
            newBucket(BucketNames.SECONDARY_MEASURES, props.targetMeasure as IAttributeOrMeasure),
            newBucket(BucketNames.TERTIARY_MEASURES, props.comparativeMeasure as IAttributeOrMeasure),
            newBucket(BucketNames.VIEW, ...(viewBy as IAttribute[])),
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace, execConfig } = props;

        const sortBy = (props.sortBy as ISortItem[]) ?? [];

        return backend
            .withTelemetry("BulletChart", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters as INullableFilter[])
            .withSorting(...sortBy)
            .withDimensions(stackedChartDimensions)
            .withExecConfig(execConfig);
    },
    propOverridesFactory: (props, _buckets) => {
        return {
            config: sanitizeConfig(
                [
                    props.primaryMeasure as IAttributeOrMeasure,
                    props.targetMeasure as IAttributeOrMeasure,
                    props.comparativeMeasure as IAttributeOrMeasure,
                ],
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
    primaryMeasure: AttributeMeasureOrPlaceholder;

    /**
     * Specify measure which contains the target/goal value. The value will be charted as the thick
     * line to reach.
     */
    targetMeasure?: AttributeMeasureOrPlaceholder;

    /**
     * Specify measure to use for comparison. This will be charted as the secondary bar.
     */
    comparativeMeasure?: AttributeMeasureOrPlaceholder;

    /**
     * Specify one or two attributes to use for slicing the measures.
     *
     * @remarks
     * If you specify two attributes, the values of these attributes will appear on the Y axis as grouped. For each
     * value of the first attribute there will be all applicable values of the second attribute. For each value of the
     * second attribute, there will be a bullet.
     */
    viewBy?: AttributeOrPlaceholder | AttributesOrPlaceholders;

    /**
     * Specify filters to apply on the data to chart.
     */
    filters?: NullableFiltersOrPlaceholders;

    /**
     * Specify how to sort the data to chart.
     */
    sortBy?: SortsOrPlaceholders;

    /**
     * Resolution context for composed placeholders.
     */
    placeholdersResolutionContext?: any;
}

/**
 * @public
 */
export interface IBulletChartProps extends IBulletChartBucketProps, IBucketChartProps {}

const WrappedBulletChart = withChart(bulletChartDefinition)(CoreBulletChart);

/**
 * Bullet chart is a variation of a bar chart that displays performance of a measure (primary measure) and its progress
 * towards a goal (target measure).
 *
 * @remarks
 * Optionally, the primary measure can also be compared to another measure (comparative measure).
 *
 * See {@link IBulletChartProps} to learn how to configure the BulletChart and the
 * {@link https://sdk.gooddata.com/gooddata-ui/docs/bullet_chart_component.html | bullet chart documentation} for more information.
 *
 * @public
 */
export const BulletChart = (props: IBulletChartProps) => {
    const [primaryMeasure, targetMeasure, comparativeMeasure, viewBy, filters, sortBy] =
        useResolveValuesWithPlaceholders(
            [
                props.primaryMeasure,
                props.targetMeasure,
                props.comparativeMeasure,
                props.viewBy,
                props.filters,
                props.sortBy,
            ],
            props.placeholdersResolutionContext,
        );

    return (
        <WrappedBulletChart
            {...props}
            {...{
                primaryMeasure,
                targetMeasure,
                comparativeMeasure,
                viewBy,
                filters,
                sortBy,
            }}
        />
    );
};
