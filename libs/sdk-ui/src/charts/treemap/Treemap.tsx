// (C) 2007-2018 GoodData Corporation
import { AttributeOrMeasure, IAttribute, IFilter, newBucket } from "@gooddata/sdk-model";
import { BucketNames } from "../../base";
import { treemapDimensions } from "../_commons/dimensions";
import { IBucketChartProps } from "../chartProps";
import { CoreTreemap } from "./CoreTreemap";
import { IChartDefinition } from "../_commons/chartDefinition";
import { withChart } from "../_base/withChart";

//
// Internals
//

const treemapDefinition: IChartDefinition<ITreemapBucketProps, ITreemapProps> = {
    bucketPropsKeys: ["measures", "viewBy", "segmentBy", "filters"],
    bucketsFactory: props => {
        return [
            newBucket(BucketNames.MEASURES, ...props.measures),
            newBucket(BucketNames.VIEW, props.viewBy),
            newBucket(BucketNames.SEGMENT, props.segmentBy),
        ];
    },
    executionFactory: (props, buckets) => {
        const { backend, workspace } = props;

        return backend
            .withTelemetry("Treemap", props)
            .workspace(workspace)
            .execution()
            .forBuckets(buckets, props.filters)
            .withDimensions(treemapDimensions);
    },
};

//
// Public interface
//

/*
 * TODO: SDK8: verify this chart - the dimensions and sorting may be hosed.
 *
 * The dimension construction that was (and is) used puts all attributes into either first or second dimension.
 * This sounds weird - why the two buckets then? on top of that, the logic that constructs sorts does so only
 * if both dimensions contain some attributes (which cannot happen). Not going to deal with this now.. transferring
 * status quo as-is.
 */

/**
 * TODO: SDK8: add docs
 *
 * @public
 */
export interface ITreemapBucketProps {
    measures: AttributeOrMeasure[];
    viewBy?: IAttribute;
    segmentBy?: IAttribute;
    filters?: IFilter[];
}

/**
 * TODO: SDK8: add docs
 *
 * @public
 */
export interface ITreemapProps extends IBucketChartProps, ITreemapBucketProps {}

/**
 * [Treemap](http://sdk.gooddata.com/gdc-ui-sdk-doc/docs/treemap_component.html)
 * is a component with bucket props measures, viewBy, filters
 *
 * @public
 */
export const Treemap = withChart(treemapDefinition)(CoreTreemap);

/*

function getDefaultTreemapSort(afm: AFM.IAfm, resultSpec: AFM.IResultSpec): AFM.SortItem[] {
    const viewByAttributeIdentifier: string = get(resultSpec, "dimensions[0].itemIdentifiers[0]");
    const stackByAttributeIdentifier: string = get(resultSpec, "dimensions[0].itemIdentifiers[1]");

    if (viewByAttributeIdentifier && stackByAttributeIdentifier) {
        return [...getAttributeSortItems(viewByAttributeIdentifier, ASC, false), ...getAllMeasuresSorts(afm)];
    }

    return [];
}
*/
