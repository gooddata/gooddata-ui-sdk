// (C) 2007-2025 GoodData Corporation

import {
    type IAttribute,
    type IAttributeOrMeasure,
    type IBucket,
    type INullableFilter,
    type ISortItem,
    bucketAttribute,
    bucketsFind,
    newAttributeSort,
    newBucket,
} from "@gooddata/sdk-model";
import {
    type AttributeMeasureOrPlaceholder,
    type AttributeOrPlaceholder,
    BucketNames,
    type NullableFiltersOrPlaceholders,
    type SortsOrPlaceholders,
    useResolveValuesWithPlaceholders,
} from "@gooddata/sdk-ui";

import { CoreHeatmap } from "./CoreHeatmap.js";
import { type IBucketChartProps } from "../../interfaces/index.js";
import { withChart } from "../_base/withChart.js";
import { type IChartDefinition } from "../_commons/chartDefinition.js";
import { heatmapDimensions } from "../_commons/dimensions.js";

//
// Internals
//

const heatmapDefinition: IChartDefinition<IHeatmapBucketProps, IHeatmapProps> = {
    chartName: "Heatmap",
    bucketPropsKeys: ["measure", "rows", "columns", "filters", "sortBy"],
    bucketsFactory: (props) => {
        return [
            newBucket(BucketNames.MEASURES, props.measure as IAttributeOrMeasure),
            newBucket(BucketNames.VIEW, props.rows as IAttribute),
            newBucket(BucketNames.STACK, props.columns as IAttribute),
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace, execConfig } = props;
        const sortBy = props.sortBy ?? getDefaultHeatmapSort(buckets);

        return backend
            .withTelemetry("Heatmap", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters as INullableFilter[])
            .withSorting(...(sortBy as ISortItem[]))
            .withDimensions(heatmapDimensions)
            .withExecConfig(execConfig);
    },
};

//
// Public interface
//

/**
 * @public
 */
export interface IHeatmapBucketProps {
    /**
     * Specify measure whose values will be charted on the heatmap.
     */
    measure: AttributeMeasureOrPlaceholder;

    /**
     * Specify attribute, whose values will be used to create rows in the heatmap.
     */
    rows?: AttributeOrPlaceholder;

    /**
     * Specify attribute, whose values will be used to create columns in the heatmap.
     */
    columns?: AttributeOrPlaceholder;

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
export interface IHeatmapProps extends IBucketChartProps, IHeatmapBucketProps {}

const WrappedHeatmap = withChart(heatmapDefinition)(CoreHeatmap);

/**
 * Heatmap represents data as a matrix where individual values are represented as colors.
 * Heatmaps can help you discover trends and understand complex datasets.
 *
 * @remarks
 * See {@link IHeatmapProps} to learn how to configure the Heatmap and the
 * {@link https://www.gooddata.com/docs/gooddata-ui/latest/references/visual_components/heatmap | heatmap documentation} for more information.
 *
 * @public
 */
export function Heatmap(props: IHeatmapProps) {
    const [measure, rows, columns, filters, sortBy] = useResolveValuesWithPlaceholders(
        [props.measure, props.rows, props.columns, props.filters, props.sortBy],
        props.placeholdersResolutionContext,
    );

    return (
        <WrappedHeatmap
            {...props}
            {...{
                measure,
                rows,
                columns,
                filters,
                sortBy,
            }}
        />
    );
}

function getDefaultHeatmapSort(buckets: IBucket[]): ISortItem[] {
    const viewBucket = bucketsFind(buckets, BucketNames.VIEW);
    const viewAttribute = viewBucket ? bucketAttribute(viewBucket) : undefined;
    if (viewAttribute) {
        return [newAttributeSort(viewAttribute, "desc")];
    }

    return [];
}
