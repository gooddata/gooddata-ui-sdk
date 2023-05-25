// (C) 2023 GoodData Corporation
import React from "react";
import { IAttribute, IAttributeOrMeasure, INullableFilter, newBucket } from "@gooddata/sdk-model";
import {
    BucketNames,
    useResolveValuesWithPlaceholders,
    AttributeOrPlaceholder,
    NullableFiltersOrPlaceholders,
    SortsOrPlaceholders,
} from "@gooddata/sdk-ui";
import { dependencyWheelDimensions } from "../_commons/dimensions.js";
import { IBucketChartProps } from "../../interfaces/index.js";
import { CoreDependencyWheelChart } from "./CoreDependencyWheelChart.js";
import { IChartDefinition } from "../_commons/chartDefinition.js";
import { withChart } from "../_base/withChart.js";

//
// Internals
//

const dependencyWheelChartDefinition: IChartDefinition<
    IDependencyWheelChartBucketProps,
    IDependencyWheelChartProps
> = {
    chartName: "DependencyWheelChart",
    bucketPropsKeys: ["measure", "attributeFrom", "attributeTo", "filters", "sortBy"],
    bucketsFactory: (props) => {
        return [
            newBucket(BucketNames.MEASURES, props.measure as IAttributeOrMeasure),
            newBucket(BucketNames.ATTRIBUTE_FROM, props.attributeFrom as IAttribute),
            newBucket(BucketNames.ATTRIBUTE_TO, props.attributeTo as IAttribute),
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace, execConfig } = props;

        return backend
            .withTelemetry("DependencyWheelChart", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters as INullableFilter[])
            .withDimensions(dependencyWheelDimensions)
            .withExecConfig(execConfig);
    },
};

//
// Public interface
//

/**
 * @public
 */
export interface IDependencyWheelChartBucketProps {
    /**
     * Specify a measure whose values will be displayed as the width of the links
     */
    measure: IAttributeOrMeasure;

    /**
     * Specify attribute, whose values will be used to create from element.
     */
    attributeFrom?: AttributeOrPlaceholder;

    /**
     * Specify attribute, whose values will be used to create to element.
     */
    attributeTo?: AttributeOrPlaceholder;

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
export interface IDependencyWheelChartProps extends IBucketChartProps, IDependencyWheelChartBucketProps {}

const WrappedDependencyWheelChart = withChart(dependencyWheelChartDefinition)(CoreDependencyWheelChart);

/**
 * A dependency wheel is a type of flow diagram, where nodes are laid out in a circle, and links are drawn between them.
 * This width of the link and size of the nodes are proportional to the flow quantity or weight of each link.
 *
 * @remarks
 * A DependencyWheel diagram can be displayed with one measure and one or two attributes,
 * where the measure represents the width of the links and the attributes represent the nodes of the links
 *
 * See {@link IDependencyWheelChartProps} to learn how to configure the DependencyWheelChart.
 *
 * @public
 */
export const DependencyWheelChart = (props: IDependencyWheelChartProps) => {
    const [measure, attributeFrom, attributeTo, filters, sortBy] = useResolveValuesWithPlaceholders(
        [props.measure, props.attributeFrom, props.attributeTo, props.filters, props.sortBy],
        props.placeholdersResolutionContext,
    );

    return (
        <WrappedDependencyWheelChart
            {...props}
            {...{
                measure,
                attributeFrom,
                attributeTo,
                filters,
                sortBy,
            }}
        />
    );
};
