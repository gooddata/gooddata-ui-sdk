// (C) 2024-2025 GoodData Corporation

import {
    type DimensionItem,
    type IAttribute,
    type IAttributeOrMeasure,
    type IBucket,
    type IDimension,
    type IMeasure,
    type IdentifierRef,
    MeasureGroupIdentifier,
    attributeDisplayFormRef,
    bucketAttributes,
    bucketMeasures,
    bucketsFind,
    isArithmeticMeasure,
    isInlineMeasure,
    isMeasure,
    measureAggregation,
    measureAlias,
    measureFormat,
    measureItem,
    measureLocalId,
    measureTitle,
    modifyInlineMeasure,
    newBucket,
    newDimension,
    newInlineMeasure,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import {
    type ChartInlineVisualizationType,
    type IInlineVisualizationsConfig,
} from "../../../interfaces/index.js";

/**
 * Returns an inline measure definition created from a standalone measure.
 *
 * This should be used in case there is some other slicing attribute in the insight.
 * We want to avoid slicing by the slicing attribute and keep only slicing by the main row attribute.
 *
 * @internal
 *
 * @param measure - measure to be transformed
 * @param mainRowAttributeId - the main slicing attribute id
 * @returns IMeasure
 */
export function transformStandaloneMeasureToInline(measure: IMeasure, mainRowAttributeId: string): IMeasure {
    if (isInlineMeasure(measure)) {
        return measure;
    }
    if (isArithmeticMeasure(measure)) {
        return measure;
    }

    const itemRef = measureItem(measure) as IdentifierRef;
    const aggregation = measureAggregation(measure);
    const itemIdentifier = `{${itemRef.type === "measure" ? "metric" : itemRef.type}/${itemRef.identifier}}`;

    let maqlExpression: string;
    if (aggregation) {
        maqlExpression = `SELECT ${aggregation}(${itemIdentifier})`;
    } else {
        maqlExpression = `SELECT ${itemIdentifier}`;
    }
    maqlExpression += ` BY ALL OTHER EXCEPT {label/${mainRowAttributeId}}`;

    const inlineMeasure = newInlineMeasure(maqlExpression);

    return modifyInlineMeasure(inlineMeasure, (m) =>
        m
            .format(measureFormat(measure))
            .localId(measureLocalId(measure))
            .title(measureTitle(measure))
            .alias(measureAlias(measure)),
    );
}

/**
 * Constructs repeater buckets from the provided attributes, columns and viewBy
 *
 * @internal
 */
export function constructRepeaterBuckets(
    rowAttribute: IAttribute,
    columns: IAttributeOrMeasure[],
    viewBy?: IAttribute,
    inlineVisualizations?: IInlineVisualizationsConfig,
): IBucket[] {
    const mainRowAttributeRef = attributeDisplayFormRef(rowAttribute) as IdentifierRef;
    const mainRowAttributeId = mainRowAttributeRef.identifier;
    const isExecutionSliced = !!viewBy;
    const sanitizedColumnsBucketItems = columns.map((item) => {
        if (isMeasure(item)) {
            const localId = measureLocalId(item);
            const isStandaloneMeasure =
                ((inlineVisualizations?.[localId]?.type as ChartInlineVisualizationType) ?? "metric") ===
                "metric";

            return isStandaloneMeasure && isExecutionSliced
                ? transformStandaloneMeasureToInline(item, mainRowAttributeId)
                : item;
        }

        return item;
    });

    return [
        newBucket(BucketNames.ATTRIBUTE, rowAttribute),
        newBucket(BucketNames.COLUMNS, ...sanitizedColumnsBucketItems),
        viewBy ? newBucket(BucketNames.VIEW, viewBy) : undefined,
    ].filter(Boolean) as IBucket[];
}

/**
 * Constructs repeater execution dimensions from the provided buckets.
 *
 * @internal
 */
export function constructRepeaterDimensions(buckets: IBucket[]): IDimension[] {
    // Row attribute
    const rowAttributeBucket = bucketsFind(buckets, BucketNames.ATTRIBUTE);
    const rowAttributeBucketAttributes = rowAttributeBucket ? bucketAttributes(rowAttributeBucket) : [];
    const rowAttribute = rowAttributeBucketAttributes[0];

    // Columns (row attribute display forms + visualization measures)
    const columnsBucket = bucketsFind(buckets, BucketNames.COLUMNS);
    let columnBucketMeasures: IAttributeOrMeasure[] = [];
    let columnBucketAttributes: IAttribute[] = [];
    if (columnsBucket) {
        columnBucketMeasures = columnsBucket ? bucketMeasures(columnsBucket) : [];
        columnBucketAttributes = columnsBucket ? bucketAttributes(columnsBucket) : [];
    }

    // Slice by attribute
    const viewBucket = bucketsFind(buckets, BucketNames.VIEW);
    let viewBucketAttributes: IAttribute[] = [];
    let viewAttribute: IAttribute | undefined;
    if (viewBucket) {
        viewBucketAttributes = bucketAttributes(viewBucket);
        viewAttribute = viewBucketAttributes[0];
    }

    const dimensions: DimensionItem[][] = [[rowAttribute, ...columnBucketAttributes]];

    if (viewAttribute || columnBucketMeasures.length > 0) {
        dimensions.push([]);
    }

    if (viewAttribute) {
        dimensions[1].push(viewAttribute);
    }

    if (columnBucketMeasures.length > 0) {
        dimensions[1].push(MeasureGroupIdentifier);
    }

    return dimensions.map((d) => newDimension(d));
}
