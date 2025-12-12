// (C) 2025 GoodData Corporation

import {
    type IDimension,
    type IExecutionDefinition,
    MeasureGroupIdentifier,
    bucketsAttributes,
    bucketsMeasures,
    newDimension,
} from "@gooddata/sdk-model";

/**
 * Builds execution dimensions for geo chart queries.
 *
 * @remarks
 * This utility is shared by both pushpin and area adapters to avoid code duplication.
 * It creates the proper dimension structure based on the buckets in the execution definition.
 *
 * @param def - The execution definition containing buckets
 * @returns Array of dimensions for the execution
 *
 * @internal
 */
export function getGeoChartDimensions(def: IExecutionDefinition): IDimension[] {
    const buckets = def.buckets;
    const measures = bucketsMeasures(buckets);
    const attributes = bucketsAttributes(buckets);
    return [
        ...(measures.length > 0 ? [newDimension([MeasureGroupIdentifier])] : []),
        newDimension(attributes),
    ];
}
