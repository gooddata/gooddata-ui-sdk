// (C) 2021-2022 GoodData Corporation

import {
    ExtendedDashboardItem,
    InternalDashboardItemDefinition,
    isStashedDashboardItemsId,
    StashedDashboardItemsId,
} from "../../../types/layoutTypes.js";
import { LayoutStash } from "../../../store/layout/layoutState.js";

export interface ItemResolutionResult {
    /**
     * Existing layout stashes that were used by the item definitions.
     */
    existing: StashedDashboardItemsId[];

    /**
     * Missing layout stashes that were incorrectly used by the item definitions.
     */
    missing: StashedDashboardItemsId[];

    /**
     * All resolved items in the order they were encountered. This includes both the actual items that were
     * included among the item definitions and items retrieved from stashes.
     *
     * This is the array that contains all items to use in the further processing.
     */
    resolved: ExtendedDashboardItem[];

    /**
     * A bitmap of the same cardinality as the `resolved` array; for each item in the resolved array, this
     * bitmap contains indicator whether the item is new or was retrieved from stash.
     *
     * This bitmap is essential for handlers that need to perform additional processing for newly added items
     * but can ignore (or do slightly different processing) for items that were already on the dashboard
     * but were stashed.
     */
    newItemBitmap: boolean[];
}

/**
 * Given layout stash and a list of dashboard item definitions, this function will validate and resolve those
 * item definitions into actual dashboard items that can be added onto the layout.
 *
 * The dashboard item definitions provided as input in the commands may contain mix of actual dashboard items
 * and identifiers of stashes that contain the actual items. This function resolves any stashes that may be
 * included on the input into the actual items and returns them so that the rest of the code does not have
 * to care about the stashes anymore.
 *
 * @param stash - current state of the layout stash
 * @param itemDefinitions - item definitions
 */
export function validateAndResolveStashedItems(
    stash: LayoutStash,
    itemDefinitions: ReadonlyArray<InternalDashboardItemDefinition>,
): ItemResolutionResult {
    const result: ItemResolutionResult = {
        missing: [],
        existing: [],
        resolved: [],
        newItemBitmap: [],
    };

    itemDefinitions.forEach((item) => {
        if (!isStashedDashboardItemsId(item)) {
            result.resolved.push(item);
            result.newItemBitmap.push(true);

            return;
        }

        if (stash[item] !== undefined) {
            result.existing.push(item);
            result.resolved.push(...stash[item]);
            result.newItemBitmap.push(...stash[item].map((_) => false));
        } else {
            result.missing.push(item);
        }
    });

    return result;
}
