// (C) 2019 GoodData Corporation
import React from "react";
import {
    applyRatioRule,
    IAttribute,
    IAttributeOrMeasure,
    IFilter,
    INullableFilter,
    ISortItem,
    newBucket,
} from "@gooddata/sdk-model";
import {
    BucketNames,
    IMeasurePlaceholder,
    IMeasureGroupPlaceholder,
    IAttributePlaceholder,
    IAttributeGroupPlaceholder,
    IFilterPlaceholder,
    IFilterGroupPlaceholder,
    useResolveValuesWithPlaceholders,
    IComputedPlaceholder,
} from "@gooddata/sdk-ui";
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
        const { backend, workspace } = props;

        return backend
            .withTelemetry("BarChart", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters as IFilter[])
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
 * @public
 */
export interface IBarChartBucketProps {
    /**
     * Specify one or more measures to display on the bar chart.
     *
     * Note: it is possible to also include an attribute object among measures. In that case cardinality of the
     * attribute elements will be charted.
     */
    measures:
        | IMeasureGroupPlaceholder
        | IAttributeGroupPlaceholder
        | IComputedPlaceholder<any, any>
        | Array<
              | IAttributeOrMeasure
              | IMeasurePlaceholder
              | IAttributePlaceholder
              | IMeasureGroupPlaceholder
              | IAttributeGroupPlaceholder
              | IComputedPlaceholder<any, any>
          >;

    /**
     * Optionally specify one or two attributes to slice the measures along the Y axis.
     *
     * If you specify two attributes, the values of these attributes will appear on the Y axis as grouped. For each
     * value of the first attribute there will be all applicable values of the second attribute. For each value of the
     * second attribute there will be a bar indicating the respective slice's value.
     */
    viewBy?:
        | IAttribute
        | IAttributePlaceholder
        | IAttributeGroupPlaceholder
        | Array<IAttribute | IAttributePlaceholder | IAttributeGroupPlaceholder>;

    /**
     * Optionally specify attribute to stack the bars by.
     */
    stackBy?: IAttribute | IAttributePlaceholder;

    /**
     * Optionally specify filters to apply on the data to chart.
     */
    filters?: IFilterGroupPlaceholder | Array<INullableFilter | IFilterPlaceholder | IFilterGroupPlaceholder>;

    /**
     * Optionally specify how to sort the data to chart.
     */
    sortBy?: ISortItem[];
}

/**
 * @public
 */
export interface IBarChartProps extends IBarChartBucketProps, IBucketChartProps {}

const WrappedBarChart = withChart(barChartDefinition)(CoreBarChart);

/**
 * [BarChart](http://sdk.gooddata.com/gooddata-ui/docs/bar_chart_component.html)
 *
 * Bar chart shows data in horizontal bars. Bar charts can display one or multiple metrics side by side divided by
 * attribute values or a single measure stacked by attribute values.
 *
 * @remarks See {@link IBarChartProps} to learn how to configure the AreaChart
 * @public
 */
export const BarChart = (props: IBarChartProps) => {
    const [measures, viewBy, stackBy, filters] = useResolveValuesWithPlaceholders([
        props.measures,
        props.viewBy,
        props.stackBy,
        props.filters,
    ]);

    return (
        <WrappedBarChart {...props} measures={measures} viewBy={viewBy} stackBy={stackBy} filters={filters} />
    );
};
