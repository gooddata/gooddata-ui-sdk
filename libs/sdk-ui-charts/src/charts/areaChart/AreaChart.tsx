// (C) 2007-2023 GoodData Corporation
import React from "react";
import {
    applyRatioRule,
    IAttribute,
    IAttributeOrMeasure,
    INullableFilter,
    ISortItem,
    newBucket,
} from "@gooddata/sdk-model";
import { truncate } from "../_commons/truncate.js";
import { IBucketChartProps, IChartConfig, ViewByAttributesLimit } from "../../interfaces/index.js";
import {
    BucketNames,
    useResolveValuesWithPlaceholders,
    AttributesMeasuresOrPlaceholders,
    AttributeOrPlaceholder,
    AttributesOrPlaceholders,
    NullableFiltersOrPlaceholders,
    SortsOrPlaceholders,
} from "@gooddata/sdk-ui";
import { stackedChartDimensions } from "../_commons/dimensions.js";
import { CoreAreaChart } from "./CoreAreaChart.js";
import { IChartDefinition } from "../_commons/chartDefinition.js";
import isNil from "lodash/isNil.js";
import { withChart } from "../_base/withChart.js";
import { sanitizeConfig } from "../_commons/sanitizeStacking.js";

//
// Internals
//

const areaChartDefinition: IChartDefinition<IAreaChartBucketProps, IAreaChartProps> = {
    chartName: "AreaChart",
    bucketPropsKeys: ["measures", "viewBy", "stackBy", "filters", "sortBy"],
    bucketsFactory: (props) => {
        const { measures, viewBy, stackBy } = getBucketsProps(props);
        const sanitizedMeasures = applyRatioRule(measures);
        return [
            newBucket(BucketNames.MEASURES, ...sanitizedMeasures),
            newBucket(BucketNames.VIEW, ...viewBy),
            newBucket(BucketNames.STACK, ...stackBy),
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace, execConfig } = props;

        const sortBy = (props.sortBy as ISortItem[]) ?? [];
        return backend
            .withTelemetry("AreaChart", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters as INullableFilter[])
            .withSorting(...sortBy)
            .withDimensions(stackedChartDimensions)
            .withExecConfig(execConfig);
    },
    propOverridesFactory: (props, buckets) => {
        const config = getConfigProps(props);

        return {
            config: sanitizeConfig(buckets, config),
        };
    },
    onBeforePropsConversion: verifyBuckets,
};

function getStackConfiguration(config: IChartConfig = {}): IChartConfig {
    const { stackMeasures, stackMeasuresToPercent } = config;
    if (isNil(stackMeasures) && isNil(stackMeasuresToPercent)) {
        return config;
    }
    return {
        ...config,
        stacking: Boolean(stackMeasuresToPercent) || Boolean(stackMeasures),
    };
}

export function getBucketsProps(props: IAreaChartBucketProps): {
    measures: IAttributeOrMeasure[];
    viewBy: IAttribute[];
    stackBy: IAttribute[];
} {
    const { measures, stackBy } = props;
    const viewBy = truncate(props.viewBy, ViewByAttributesLimit);

    if (viewBy.length <= 1) {
        return {
            measures: (measures as IAttributeOrMeasure[]) || [],
            viewBy: viewBy as IAttribute[],
            stackBy: stackBy ? [stackBy as IAttribute] : [],
        };
    }

    // for case viewBy 2 attributes
    const [firstMeasure] = measures; // only take first measure
    const [firstAttribute, secondAttribute] = viewBy; // only take first two attributes

    return {
        measures: [firstMeasure as IAttributeOrMeasure],
        viewBy: [firstAttribute as IAttribute], // one attribute for viewBy which slices measure vertically
        stackBy: [secondAttribute as IAttribute], // one attribute for stackBy which slices measure horizontally
    };
}

export function getConfigProps(props: IAreaChartProps): IChartConfig {
    const viewBy = truncate(props.viewBy, ViewByAttributesLimit);
    if (viewBy.length <= 1) {
        return getStackConfiguration(props.config);
    }

    return {
        ...props.config,
        stacking: false, // area sections are always overlapped with two attributes
        stackMeasures: false,
        stackMeasuresToPercent: false,
    };
}

/**
 * Show warning to SDK user in console log
 */
function verifyBuckets(props: IAreaChartProps): void {
    const viewBy = truncate(props.viewBy, ViewByAttributesLimit);
    if (viewBy.length <= 1) {
        return;
    }

    const { measures = [], stackBy } = props;
    if (measures.length > 1 || stackBy) {
        console.warn(
            "When there are two attributes in viewBy, only first measure is taken and attribute in stackBy is ignored",
        );
    }
}

//
// Public interface
//

/**
 * @public
 */
export interface IAreaChartBucketProps {
    /**
     * Specify one or more measures to display on area chart.
     *
     * @remarks
     * Note: it is possible to also include an attribute object among measures. In that case cardinality of the
     * attribute elements will be charted.
     */
    measures: AttributesMeasuresOrPlaceholders;

    /**
     * Specify attributes to slice and stack the area chart.
     *
     * @remarks
     * -  If you specify single attribute, then elements of this attribute will be used to slice the measures along the
     *    X axis.
     *
     * -  If you specify two attributes, then the first attribute will be used to slice the measures along the X axis,
     *    and the second attribute will be used for stacking.
     *
     * -  If you specify three or more attributes, only the first two attributes will be used.
     *
     * Note: using two measures in viewBy is a convenience. It is equivalent to specifying single viewBy and single
     * stackBy attribute. In either case, as soon as the area chart is stacked, only the first measure will be
     * calculated and charted.
     */
    viewBy?: AttributeOrPlaceholder | AttributesOrPlaceholders;

    /**
     * Specify attribute to stack by. This is only applicable if you specify at most single viewBy
     * attribute.
     *
     * @remarks
     * Note: stacking area chart using attribute elements means only a single measure can be charted. The component
     * will take the first measure.
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
export interface IAreaChartProps extends IBucketChartProps, IAreaChartBucketProps {}

const WrappedAreaChart = withChart(areaChartDefinition)(CoreAreaChart);

/**
 * Area chart shows data as an area under a line intersecting dots.
 *
 * @remarks
 * It can display either:
 *
 * - multiple measures sliced by a single attribute, as different areas
 * - or a single measure split by one attribute into multiple areas with points intersecting attribute values
 *
 * Areas for multiple measures stack by default. Alternatively, the areas can overlap if `{ stackMeasures: false }`.
 *
 * See {@link IAreaChartProps} to learn how it is possible to configure the AreaChart and the
 * {@link https://sdk.gooddata.com/gooddata-ui/docs/area_chart_component.html | area chart documentation} for more information.
 *
 * @public
 */
export const AreaChart = (props: IAreaChartProps) => {
    const [measures, viewBy, stackBy, filters, sortBy] = useResolveValuesWithPlaceholders(
        [props.measures, props.viewBy, props.stackBy, props.filters, props.sortBy],
        props.placeholdersResolutionContext,
    );

    return (
        <WrappedAreaChart
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
