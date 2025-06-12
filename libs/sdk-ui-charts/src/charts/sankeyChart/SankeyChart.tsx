// (C) 2007-2023 GoodData Corporation
import React from "react";
import { IAttribute, IAttributeOrMeasure, INullableFilter, newBucket } from "@gooddata/sdk-model";
import {
    BucketNames,
    useResolveValuesWithPlaceholders,
    AttributeOrPlaceholder,
    NullableFiltersOrPlaceholders,
    SortsOrPlaceholders,
} from "@gooddata/sdk-ui";
import { sankeyDimensions } from "../_commons/dimensions.js";
import { IBucketChartProps } from "../../interfaces/index.js";
import { CoreSankeyChart } from "./CoreSankeyChart.js";
import { IChartDefinition } from "../_commons/chartDefinition.js";
import { withChart } from "../_base/withChart.js";

//
// Internals
//

const sankeyChartDefinition: IChartDefinition<ISankeyChartBucketProps, ISankeyChartProps> = {
    chartName: "SankeyChart",
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
            .withTelemetry("SankeyChart", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters as INullableFilter[])
            .withDimensions(sankeyDimensions)
            .withExecConfig(execConfig);
    },
};

//
// Public interface
//

/**
 * @public
 */
export interface ISankeyChartBucketProps {
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
export interface ISankeyChartProps extends IBucketChartProps, ISankeyChartBucketProps {}

const WrappedSankeyChart = withChart(sankeyChartDefinition)(CoreSankeyChart);

/**
 * A Sankey diagram is a type of flow diagram,
 * in which the width of the link between two nodes is shown proportionally to the flow quantity.
 *
 * @remarks
 * A Sankey diagram can be displayed with one measure and one or two attributes,
 * where the measure represents the width of the links and the attributes represent the nodes of the links
 *
 * See {@link ISankeyChartProps} to learn how to configure the SankeyChart.
 *
 * @public
 */
export const SankeyChart = (props: ISankeyChartProps) => {
    const [measure, attributeFrom, attributeTo, filters, sortBy] = useResolveValuesWithPlaceholders(
        [props.measure, props.attributeFrom, props.attributeTo, props.filters, props.sortBy],
        props.placeholdersResolutionContext,
    );

    return (
        <WrappedSankeyChart
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
