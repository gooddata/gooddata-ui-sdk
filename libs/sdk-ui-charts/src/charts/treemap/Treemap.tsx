// (C) 2007-2018 GoodData Corporation
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
import { BucketNames } from "@gooddata/sdk-ui";
import { treemapDimensions } from "../_commons/dimensions";
import { IBucketChartProps } from "../../interfaces";
import { CoreTreemap } from "./CoreTreemap";
import { IChartDefinition } from "../_commons/chartDefinition";
import { withChart } from "../_base/withChart";

//
// Internals
//

const treemapDefinition: IChartDefinition<ITreemapBucketProps, ITreemapProps> = {
    chartName: "Treemap",
    bucketPropsKeys: ["measures", "viewBy", "segmentBy", "filters"],
    bucketsFactory: (props) => {
        return [
            newBucket(BucketNames.MEASURES, ...props.measures),
            newBucket(BucketNames.VIEW, props.viewBy),
            newBucket(BucketNames.SEGMENT, props.segmentBy),
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace } = props;
        const sortBy = getDefaultTreemapSort(buckets);

        return backend
            .withTelemetry("Treemap", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters)
            .withSorting(...sortBy)
            .withDimensions(treemapDimensions);
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
    measures: IAttributeOrMeasure[];

    /**
     * Optionally specify an attribute whose values will be used to slice the measure. Treemap will chart one
     * rectangle for each attribute value, these rectangles represent unique entities in the hierarchy,
     * each will be colored uniquely.
     *
     * Note: treemap only supports viewBy only when `measures` contains a single measure.
     */
    viewBy?: IAttribute;

    /**
     * Optionally specify an attribute, whose values will be used to segment the rectangles created for
     * the measures or the combination of measure and viewBy attribute values. Segmenting essentially adds
     * another level into the hierarchy.
     */
    segmentBy?: IAttribute;

    /**
     * Optionally specify filters to apply on the data to chart.
     */
    filters?: INullableFilter[];
}

/**
 * @public
 */
export interface ITreemapProps extends IBucketChartProps, ITreemapBucketProps {}

/**
 * [Treemap](https://sdk.gooddata.com/gooddata-ui/docs/treemap_component.html)
 *
 * Treemap chart presents your data hierarchically as nested rectangles.
 * Treemaps are useful for comparing proportions within the hierarchy.
 *
 * @public
 */
export const Treemap = withChart(treemapDefinition)(CoreTreemap);

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
