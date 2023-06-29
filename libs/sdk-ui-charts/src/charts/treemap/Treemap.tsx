// (C) 2007-2022 GoodData Corporation
import React from "react";
import {
    bucketAttribute,
    bucketsFind,
    bucketsMeasures,
    IAttribute,
    IAttributeOrMeasure,
    IBucket,
    INullableFilter,
    ISortItem,
    newAttributeSort,
    newBucket,
    newMeasureSort,
} from "@gooddata/sdk-model";
import {
    BucketNames,
    useResolveValuesWithPlaceholders,
    AttributesMeasuresOrPlaceholders,
    AttributeOrPlaceholder,
    NullableFiltersOrPlaceholders,
} from "@gooddata/sdk-ui";
import { treemapDimensions } from "../_commons/dimensions.js";
import { IBucketChartProps } from "../../interfaces/index.js";
import { CoreTreemap } from "./CoreTreemap.js";
import { IChartDefinition } from "../_commons/chartDefinition.js";
import { withChart } from "../_base/withChart.js";

//
// Internals
//

const treemapDefinition: IChartDefinition<ITreemapBucketProps, ITreemapProps> = {
    chartName: "Treemap",
    bucketPropsKeys: ["measures", "viewBy", "segmentBy", "filters"],
    bucketsFactory: (props) => {
        return [
            newBucket(BucketNames.MEASURES, ...(props.measures as IAttributeOrMeasure[])),
            newBucket(BucketNames.VIEW, props.viewBy as IAttribute),
            newBucket(BucketNames.SEGMENT, props.segmentBy as IAttribute),
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace, execConfig } = props;
        const sortBy = getDefaultTreemapSort(buckets);

        return backend
            .withTelemetry("Treemap", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters as INullableFilter[])
            .withSorting(...sortBy)
            .withDimensions(treemapDimensions)
            .withExecConfig(execConfig);
    },
};

//
// Public interface
//

/**
 * @public
 */
export interface ITreemapBucketProps {
    /**
     * Specify one or more measures whose values will be used to create the treemap rectangles.
     */
    measures: AttributesMeasuresOrPlaceholders;

    /**
     * Specify an attribute whose values will be used to slice the measure.
     *
     * @remarks
     * Treemap will chart one rectangle for each attribute value, these rectangles represent unique
     * entities in the hierarchy, each will be colored uniquely.
     *
     * Note: treemap only supports viewBy only when `measures` contains a single measure.
     */
    viewBy?: AttributeOrPlaceholder;

    /**
     * Specify an attribute, whose values will be used to segment the rectangles created for
     * the measures or the combination of measure and viewBy attribute values.
     *
     * @remarks
     * Segmenting essentially adds another level into the hierarchy.
     */
    segmentBy?: AttributeOrPlaceholder;

    /**
     * Specify filters to apply on the data to chart.
     */
    filters?: NullableFiltersOrPlaceholders;

    /**
     * Resolution context for composed placeholders.
     */
    placeholdersResolutionContext?: any;
}

/**
 * @public
 */
export interface ITreemapProps extends IBucketChartProps, ITreemapBucketProps {}

const WrappedTreemap = withChart(treemapDefinition)(CoreTreemap);

/**
 * Treemap chart presents your data hierarchically as nested rectangles.
 *
 * @remarks
 * Treemaps are useful for comparing proportions within the hierarchy.
 *
 * See {@link ITreemapProps} to learn how to configure the Treemap and the
 * {@link https://sdk.gooddata.com/gooddata-ui/docs/treemap_component.html | treemap documentation} for more information.
 *
 * @public
 */
export const Treemap = (props: ITreemapProps) => {
    const [measures, viewBy, segmentBy, filters] = useResolveValuesWithPlaceholders(
        [props.measures, props.viewBy, props.segmentBy, props.filters],
        props.placeholdersResolutionContext,
    );

    return (
        <WrappedTreemap
            {...props}
            {...{
                measures,
                viewBy,
                segmentBy,
                filters,
            }}
        />
    );
};

function getDefaultTreemapSort(buckets: IBucket[]): ISortItem[] {
    const viewBucket = bucketsFind(buckets, BucketNames.VIEW);
    const segmentBucket = bucketsFind(buckets, BucketNames.SEGMENT);
    const viewAttribute: IAttribute | undefined = viewBucket ? bucketAttribute(viewBucket) : undefined;
    const segmentAttribute: IAttribute | undefined = segmentBucket
        ? bucketAttribute(segmentBucket)
        : undefined;

    if (viewAttribute && segmentAttribute) {
        const measures = bucketsMeasures(buckets);

        return [
            newAttributeSort(viewAttribute, "asc"),
            ...measures.map((measure) => newMeasureSort(measure, "desc")),
        ];
    }

    return [];
}
