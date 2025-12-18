// (C) 2025 GoodData Corporation

import { BucketNames } from "@gooddata/sdk-ui";

import type { FilterSpecification } from "../../layers/common/mapFacade.js";
import { EMPTY_SEGMENT_VALUE } from "../../layers/pushpin/constants.js";

/**
 * Generic helper to create a MapLibre filter for selected segment items.
 *
 * @remarks
 * MapLibre serializes nested objects in feature properties as JSON strings.
 * The ["object", ...] expression parses the JSON string back to an object
 * so we can access the nested "uri" property.
 *
 * @internal
 */
export function createSegmentFilter(selectedSegmentItems: string[]): FilterSpecification {
    return [
        "match",
        ["get", "uri", ["object", ["get", BucketNames.SEGMENT]]],
        selectedSegmentItems.length ? selectedSegmentItems : [EMPTY_SEGMENT_VALUE],
        true,
        false,
    ];
}
