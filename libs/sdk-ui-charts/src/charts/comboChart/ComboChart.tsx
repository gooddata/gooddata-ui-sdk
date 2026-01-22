// (C) 2007-2026 GoodData Corporation

import {
    ComputeRatioRule,
    type IAttribute,
    type IMeasure,
    type INullableFilter,
    type ISortItem,
    applyRatioRule,
    newBucket,
} from "@gooddata/sdk-model";
import {
    type AttributeOrPlaceholder,
    type AttributesOrPlaceholders,
    BucketNames,
    type MeasuresOrPlaceholders,
    type NullableFiltersOrPlaceholders,
    type SortsOrPlaceholders,
    useResolveValuesWithPlaceholders,
} from "@gooddata/sdk-ui";

import { CoreComboChart } from "./CoreComboChart.js";
import { type IChartConfig } from "../../interfaces/chartConfig.js";
import { type IBucketChartProps } from "../../interfaces/chartProps.js";
import { withChart } from "../_base/withChart.js";
import { type IChartDefinition } from "../_commons/chartDefinition.js";
import { defaultDimensions } from "../_commons/dimensions.js";
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
        const categories = Array.isArray(viewBy) ? [viewBy[0]] : [viewBy];

        return [
            newBucket(BucketNames.MEASURES, ...(primaryMeasures as IMeasure[])),
            newBucket(BucketNames.SECONDARY_MEASURES, ...(secondaryMeasures as IMeasure[])),
            newBucket(BucketNames.VIEW, ...(categories as IAttribute[])),
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace, execConfig } = props;

        const sortBy = (props.sortBy as ISortItem[]) ?? [];

        return backend!
            .withTelemetry("ComboChart", props)
            .workspace(workspace!)
            .execution()
            .forBuckets(buckets, props.filters as INullableFilter[])
            .withSorting(...sortBy)
            .withDimensions(defaultDimensions)
            .withExecConfig(execConfig!);
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
    const measuresOnPrimaryAxis = isDualAxis ? primaryMeasures : [...primaryMeasures!, ...secondaryMeasures!];

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
 * enabled (you can [disable it](https://www.gooddata.com/docs/gooddata-ui/latest/references/visual_components/combo_chart#disable-the-secondary-axis)).
 *
 * The chart types used to display primary and secondary measures can be customized in {@link IChartConfig}.
 *
 * See {@link IComboChartProps} to learn how to configure the ComboChart and the
 * {@link https://www.gooddata.com/docs/gooddata-ui/latest/references/visual_components/combo_chart | combo chart documentation} for more information.
 *
 * @public
 */
export function ComboChart(props: IComboChartProps) {
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
}
