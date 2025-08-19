// (C) 2025 GoodData Corporation
import { newBucket } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { IPivotTableExecutionDefinition } from "./types.js";

/**
 * Default empty execution definition for the pivot table.
 *
 * @internal
 */
export const DEFAULT_PIVOT_TABLE_EXECUTION_DEFINITION: IPivotTableExecutionDefinition = {
    workspace: "",
    attributes: [],
    measures: [],
    dimensions: [
        {
            itemIdentifiers: [],
        },
        {
            itemIdentifiers: [],
        },
    ],
    filters: [],
    buckets: [
        newBucket(BucketNames.MEASURES),
        newBucket(BucketNames.ATTRIBUTE),
        newBucket(BucketNames.COLUMNS),
    ],
    sortBy: [],
    // TODO: if this is missing, it's causing recordings in storybooks are not matching (probably issue in sdk-backend-mockingbird)
    postProcessing: {},
};
