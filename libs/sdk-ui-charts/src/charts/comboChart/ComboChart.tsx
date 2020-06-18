// (C) 2007-2019 GoodData Corporation
import {
    ComputeRatioRule,
    applyRatioRule,
    IAttribute,
    IFilter,
    IMeasure,
    newBucket,
    ISortItem,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { defaultDimensions } from "../_commons/dimensions";
import { IChartConfig, IBucketChartProps } from "../../interfaces";
import { IChartDefinition } from "../_commons/chartDefinition";
import { CoreComboChart } from "./CoreComboChart";
import get = require("lodash/get");
import isArray = require("lodash/isArray");
import { withChart } from "../_base/withChart";
import { sanitizeConfig } from "../_commons/sanitizeStacking";

//
// Internals
//

const comboChartDefinition: IChartDefinition<IComboChartBucketProps, IComboChartProps> = {
    chartName: "ComboChart",
    bucketPropsKeys: ["primaryMeasures", "secondaryMeasures", "viewBy", "filters", "sortBy"],
    propTransformation: (props) => {
        const { primaryMeasures = [], secondaryMeasures = [] } = props;
        const isDualAxis = get(props, "config.dualAxis", true);
        const computeRatioRule =
            !isDualAxis && primaryMeasures.length + secondaryMeasures.length > 1
                ? ComputeRatioRule.NEVER
                : ComputeRatioRule.SINGLE_MEASURE_ONLY;

        return {
            ...props,
            primaryMeasures: applyRatioRule(primaryMeasures, computeRatioRule),
            secondaryMeasures: applyRatioRule(secondaryMeasures, computeRatioRule),
        };
    },
    bucketsFactory: (props) => {
        const { primaryMeasures, secondaryMeasures, viewBy } = props;
        const categories = isArray(viewBy) ? [viewBy[0]] : [viewBy];

        return [
            newBucket(BucketNames.MEASURES, ...primaryMeasures),
            newBucket(BucketNames.SECONDARY_MEASURES, ...secondaryMeasures),
            newBucket(BucketNames.VIEW, ...categories),
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace } = props;

        return backend
            .withTelemetry("ComboChart", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters)
            .withSorting(...props.sortBy)
            .withDimensions(defaultDimensions);
    },
    propOverridesFactory: (props) => {
        return {
            config: getConfiguration(props),
        };
    },
};

function getConfiguration(props: IComboChartProps): IChartConfig {
    const { primaryMeasures, secondaryMeasures, config } = props;
    const isDualAxis = get(props, "config.dualAxis", true);
    const measuresOnPrimaryAxis = isDualAxis ? primaryMeasures : [...primaryMeasures, ...secondaryMeasures];

    return sanitizeConfig(measuresOnPrimaryAxis, config);
}

//
// Public interface
//

/**
 * @public
 */
export interface IComboChartBucketProps {
    /**
     * Optionally specify primary measures to render using the primary chart type.
     */
    primaryMeasures?: IMeasure[];

    /**
     * Optionally specify secondary measures to render using the secondary chart type.
     */
    secondaryMeasures?: IMeasure[];

    /**
     * Optionally specify one or two attributes to use for slicing the measure values along the
     * X axis.
     *
     * If you specify two attributes, the values of these attributes will appear on the X axis as grouped. For each
     * value of the first attribute there will be all applicable values of the second attribute. For each value of the
     * second attribute there will be a point/column/area indicating the respective slice's value.
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
export interface IComboChartProps extends IBucketChartProps, IComboChartBucketProps {}

/**
 * [ComboChart](https://sdk.gooddata.com/gooddata-ui/docs/combo_chart_component.html)
 *
 * Combo chart combines two types of visualizations, for example, a column chart and a line chart. A combo chart can
 * have one or two axes. If a combo chart has two axes, it is often referred to as a dual axis chart.
 *
 * By default, a combo chart is displayed as a combination of a column chart and a line chart, with the secondary axis
 * enabled (you can [disable it](https://sdk.gooddata.com/gooddata-ui/docs/combo_chart_component.html#disable-the-secondary-axis)).
 *
 * The chart types used to display primary and secondary measures can be customized in {@link IChartConfig}.
 *
 * @public
 */
export const ComboChart = withChart(comboChartDefinition)(CoreComboChart);
