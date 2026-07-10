// (C) 2026 GoodData Corporation

import {
    type IAttribute,
    type IMeasure,
    type INullableFilter,
    type ISortItem,
    newBucket,
} from "@gooddata/sdk-model";
import {
    type AttributeOrPlaceholder,
    BucketNames,
    type MeasureOrPlaceholder,
    type NullableFiltersOrPlaceholders,
    type SortsOrPlaceholders,
    useResolveValuesWithPlaceholders,
} from "@gooddata/sdk-ui";

import { type IBucketChartProps } from "../../interfaces/chartProps.js";
import { withChart } from "../_base/withChart.js";
import { type IChartDefinition } from "../_commons/chartDefinition.js";
import { stackedChartDimensions } from "../_commons/dimensions.js";

import { CoreMekko } from "./CoreMekko.js";

//
// Internals
//

const mekkoDefinition: IChartDefinition<IMekkoBucketProps, IMekkoProps> = {
    chartName: "Mekko",
    bucketPropsKeys: ["widthMeasure", "heightMeasure", "viewBy", "stackBy", "filters", "sortBy"],
    bucketsFactory: (props) => {
        // Bucket order defines the MeasureGroup order consumed by getMekkoSeries:
        // MEASURES (width) -> index 0, SECONDARY_MEASURES (height) -> index 1.
        return [
            newBucket(BucketNames.MEASURES, props.widthMeasure as IMeasure),
            newBucket(BucketNames.SECONDARY_MEASURES, props.heightMeasure as IMeasure),
            newBucket(BucketNames.VIEW, props.viewBy as IAttribute),
            newBucket(BucketNames.STACK, props.stackBy as IAttribute),
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace, execConfig } = props;

        const sortBy = (props.sortBy as ISortItem[]) ?? [];

        return backend!
            .withTelemetry("Mekko", props)
            .workspace(workspace!)
            .execution()
            .forBuckets(buckets, props.filters as INullableFilter[])
            .withSorting(...sortBy)
            .withDimensions(stackedChartDimensions)
            .withExecConfig(execConfig!);
    },
};

//
// Public interface
//

/**
 * @beta
 */
export interface IMekkoBucketProps {
    /**
     * Specify the measure that sets each column's width (proportional to its value).
     */
    widthMeasure?: MeasureOrPlaceholder;

    /**
     * Specify the measure that sets each column's height, read off the Y axis.
     */
    heightMeasure?: MeasureOrPlaceholder;

    /**
     * Specify the attribute used to create the columns (one column per attribute element).
     */
    viewBy?: AttributeOrPlaceholder;

    /**
     * Specify the attribute used to stack the columns into segments.
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
 * @beta
 */
export interface IMekkoProps extends IBucketChartProps, IMekkoBucketProps {}

const WrappedMekko = withChart(mekkoDefinition)(CoreMekko);

/**
 * Mekko (Marimekko) chart shows data as stacked columns whose widths are proportional to a measure.
 *
 * @remarks
 * Each column's width is driven by the width measure, its height by the height measure, columns are
 * created from the view-by attribute, and segments come from the stack-by attribute.
 *
 * @beta
 */
export function Mekko(props: IMekkoProps) {
    const [widthMeasure, heightMeasure, viewBy, stackBy, filters, sortBy] = useResolveValuesWithPlaceholders(
        [props.widthMeasure, props.heightMeasure, props.viewBy, props.stackBy, props.filters, props.sortBy],
        props.placeholdersResolutionContext,
    );

    return (
        <WrappedMekko
            {...props}
            {...{
                widthMeasure,
                heightMeasure,
                viewBy,
                stackBy,
                filters,
                sortBy,
            }}
        />
    );
}
