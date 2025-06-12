// (C) 2019-2023 GoodData Corporation
import React from "react";
import {
    applyRatioRule,
    IAttribute,
    IAttributeOrMeasure,
    IFilter,
    ISortItem,
    newBucket,
} from "@gooddata/sdk-model";
import {
    BucketNames,
    AttributesMeasuresOrPlaceholders,
    AttributeOrPlaceholder,
    AttributesOrPlaceholders,
    NullableFiltersOrPlaceholders,
    SortsOrPlaceholders,
    useResolveValuesWithPlaceholders,
} from "@gooddata/sdk-ui";
import { IBucketChartProps, ViewByAttributesLimit } from "../../interfaces/index.js";
import { truncate } from "../_commons/truncate.js";
import { CoreBarChart } from "./CoreBarChart.js";
import { stackedChartDimensions } from "../_commons/dimensions.js";
import { IChartDefinition } from "../_commons/chartDefinition.js";
import { withChart } from "../_base/withChart.js";
import { sanitizeConfig } from "../_commons/sanitizeStacking.js";

//
// Internals
//

const barChartDefinition: IChartDefinition<IBarChartBucketProps, IBarChartProps> = {
    chartName: "BarChart",
    bucketPropsKeys: ["measures", "viewBy", "stackBy", "filters", "sortBy"],
    bucketsFactory: (props) => {
        const measures = applyRatioRule(props.measures as IAttributeOrMeasure[]);
        const viewBy = truncate(props.viewBy, ViewByAttributesLimit);

        return [
            newBucket(BucketNames.MEASURES, ...measures),
            newBucket(BucketNames.VIEW, ...(viewBy as IAttribute[])),
            newBucket(BucketNames.STACK, props.stackBy as IAttribute),
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace, execConfig } = props;

        const sortBy = (props.sortBy as ISortItem[]) ?? [];

        return backend
            .withTelemetry("BarChart", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters as IFilter[])
            .withSorting(...sortBy)
            .withDimensions(stackedChartDimensions)
            .withExecConfig(execConfig);
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
 * @public
 */
export interface IBarChartBucketProps {
    /**
     * Specify one or more measures to display on the bar chart.
     *
     * @remarks
     * Note: it is possible to also include an attribute object among measures. In that case cardinality of the
     * attribute elements will be charted.
     */
    measures: AttributesMeasuresOrPlaceholders;

    /**
     * Specify one or two attributes to slice the measures along the Y axis.
     *
     * @remarks
     * If you specify two attributes, the values of these attributes will appear on the Y axis as grouped. For each
     * value of the first attribute there will be all applicable values of the second attribute. For each value of the
     * second attribute there will be a bar indicating the respective slice's value.
     */
    viewBy?: AttributeOrPlaceholder | AttributesOrPlaceholders;

    /**
     * Specify attribute to stack the bars by.
     */
    stackBy?: AttributeOrPlaceholder;

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
export interface IBarChartProps extends IBarChartBucketProps, IBucketChartProps {}

const WrappedBarChart = withChart(barChartDefinition)(CoreBarChart);

/**
 * Bar chart shows data in horizontal bars.
 *
 * @remarks
 * Bar charts can display one or multiple metrics side by side divided by
 * attribute values or a single measure stacked by attribute values.
 *
 * See {@link IBarChartProps} to learn how to configure the BarChart and the
 *  {@link https://sdk.gooddata.com/gooddata-ui/docs/bar_chart_component.html | bar chart documentation} for more information.
 *
 * @public
 */
export const BarChart = (props: IBarChartProps) => {
    const [measures, viewBy, stackBy, filters, sortBy] = useResolveValuesWithPlaceholders(
        [props.measures, props.viewBy, props.stackBy, props.filters, props.sortBy],
        props.placeholdersResolutionContext,
    );

    return (
        <WrappedBarChart
            {...props}
            {...{
                measures,
                viewBy,
                stackBy,
                filters,
                sortBy,
            }}
        />
    );
};
