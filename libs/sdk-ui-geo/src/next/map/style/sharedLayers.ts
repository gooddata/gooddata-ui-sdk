// (C) 2025 GoodData Corporation

import { BucketNames } from "@gooddata/sdk-ui";

import type { FilterSpecification } from "../../layers/common/mapFacade.js";
import { EMPTY_SEGMENT_VALUE } from "../../layers/pushpin/constants.js";

/**
 * Generic helper to create a MapLibre filter for selected segment items.
 *
 * @internal
 */
export function createSegmentFilter(selectedSegmentItems: string[]): FilterSpecification {
    return [
        "match",
        ["get", "uri", ["get", BucketNames.SEGMENT]],
        selectedSegmentItems.length ? selectedSegmentItems : [EMPTY_SEGMENT_VALUE],
        true,
        false,
    ];
}
