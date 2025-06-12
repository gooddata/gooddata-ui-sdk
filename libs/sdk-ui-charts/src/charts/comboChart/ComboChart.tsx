// (C) 2007-2023 GoodData Corporation
import React from "react";
import {
    applyRatioRule,
    ComputeRatioRule,
    IAttribute,
    IMeasure,
    INullableFilter,
    ISortItem,
    newBucket,
} from "@gooddata/sdk-model";
import {
    BucketNames,
    MeasuresOrPlaceholders,
    AttributeOrPlaceholder,
    AttributesOrPlaceholders,
    NullableFiltersOrPlaceholders,
    SortsOrPlaceholders,
    useResolveValuesWithPlaceholders,
} from "@gooddata/sdk-ui";
import { defaultDimensions } from "../_commons/dimensions.js";
import { IBucketChartProps, IChartConfig } from "../../interfaces/index.js";
import { IChartDefinition } from "../_commons/chartDefinition.js";
import { CoreComboChart } from "./CoreComboChart.js";
import isArray from "lodash/isArray.js";
import { withChart } from "../_base/withChart.js";
import { sanitizeConfig } from "../_commons/sanitizeStacking.js";

//
// Internals
//

const comboChartDefinition: IChartDefinition<IComboChartBucketProps, IComboChartProps> = {
    chartName: "ComboChart",
    bucketPropsKeys: ["primaryMeasures", "secondaryMeasures", "viewBy", "filters", "sortBy"],
    propTransformation: (props) => {
        const { primaryMeasures = [], secondaryMeasures = [] } = props;
        const isDualAxis = props.config?.dualAxis ?? true;
        const computeRatioRule =
            !isDualAxis && primaryMeasures.length + secondaryMeasures.length > 1
                ? ComputeRatioRule.NEVER
                : ComputeRatioRule.SINGLE_MEASURE_ONLY;

        return {
            ...props,
            primaryMeasures: applyRatioRule(primaryMeasures as IMeasure[], computeRatioRule),
            secondaryMeasures: applyRatioRule(secondaryMeasures as IMeasure[], computeRatioRule),
        };
    },
    bucketsFactory: (props) => {
        const { primaryMeasures, secondaryMeasures, viewBy } = props;
        const categories = isArray(viewBy) ? [viewBy[0]] : [viewBy];

        return [
            newBucket(BucketNames.MEASURES, ...(primaryMeasures as IMeasure[])),
            newBucket(BucketNames.SECONDARY_MEASURES, ...(secondaryMeasures as IMeasure[])),
            newBucket(BucketNames.VIEW, ...(categories as IAttribute[])),
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace, execConfig } = props;

        const sortBy = (props.sortBy as ISortItem[]) ?? [];

        return backend
            .withTelemetry("ComboChart", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters as INullableFilter[])
            .withSorting(...sortBy)
            .withDimensions(defaultDimensions)
            .withExecConfig(execConfig);
    },
    propOverridesFactory: (props) => {
        return {
            config: getConfiguration(props),
        };
    },
};

function getConfiguration(props: IComboChartProps): IChartConfig {
    const { primaryMeasures, secondaryMeasures, config } = props;
    const isDualAxis = props.config?.dualAxis ?? true;
    const measuresOnPrimaryAxis = isDualAxis ? primaryMeasures : [...primaryMeasures, ...secondaryMeasures];

    return sanitizeConfig(measuresOnPrimaryAxis as IMeasure[], config);
}

//
// Public interface
//

/**
 * @public
 */
export interface IComboChartBucketProps {
    /**
     * Specify primary measures to render using the primary chart type.
     */
    primaryMeasures?: MeasuresOrPlaceholders;

    /**
     * Specify secondary measures to render using the secondary chart type.
     */
    secondaryMeasures?: MeasuresOrPlaceholders;

    /**
     * Specify one or two attributes to use for slicing the measure values along the X axis.
     *
     * @remarks
     * If you specify two attributes, the values of these attributes will appear on the X axis as grouped. For each
     * value of the first attribute there will be all applicable values of the second attribute. For each value of the
     * second attribute there will be a point/column/area indicating the respective slice's value.
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
export interface IComboChartProps extends IBucketChartProps, IComboChartBucketProps {}

const WrappedComboChart = withChart(comboChartDefinition)(CoreComboChart);

/**
 * Combo chart combines two types of visualizations, for example, a column chart and a line chart.
 *
 * @remarks
 * A combo chart can
 * have one or two axes. If a combo chart has two axes, it is often referred to as a dual axis chart.
 *
 * By default, a combo chart is displayed as a combination of a column chart and a line chart, with the secondary axis
 * enabled (you can [disable it](https://sdk.gooddata.com/gooddata-ui/docs/combo_chart_component.html#disable-the-secondary-axis)).
 *
 * The chart types used to display primary and secondary measures can be customized in {@link IChartConfig}.
 *
 * See {@link IComboChartProps} to learn how to configure the ComboChart and the
 * {@link https://sdk.gooddata.com/gooddata-ui/docs/combo_chart_component.html | combo chart documentation} for more information.
 *
 * @public
 */
export const ComboChart = (props: IComboChartProps) => {
    const [primaryMeasures, secondaryMeasures, viewBy, filters, sortBy] = useResolveValuesWithPlaceholders(
        [props.primaryMeasures, props.secondaryMeasures, props.viewBy, props.filters, props.sortBy],
        props.placeholdersResolutionContext,
    );

    return (
        <WrappedComboChart
            {...props}
            {...{
                primaryMeasures,
                secondaryMeasures,
                viewBy,
                filters,
                sortBy,
            }}
        />
    );
};
