// (C) 2025 GoodData Corporation
import { IMeasure, newBucket } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { addMeasureGroupToDimension } from "./dimensions.js";
import { IPivotTableExecutionDefinition } from "./types.js";

/**
 * Applies provided measures to the execution definition.
 *
 * @internal
 */
export const applyMeasuresToExecutionDef =
    ({ measures }: { measures: IMeasure[] }) =>
    (executionDefinition: IPivotTableExecutionDefinition): IPivotTableExecutionDefinition => {
        if (measures.length === 0) {
            return executionDefinition;
        }

        const [rowsDimension, columnsDimension] = executionDefinition.dimensions;
        const [_measuresBucket, rowsBucket, columnsBucket] = executionDefinition.buckets;
        return {
            ...executionDefinition,
            measures,
            dimensions: [rowsDimension, addMeasureGroupToDimension(columnsDimension)],
            buckets: [newBucket(BucketNames.MEASURES, ...measures), rowsBucket, columnsBucket],
        };
    };
