// (C) 2021 GoodData Corporation

import {
    DashboardItemDefinition,
    ExtendedDashboardItem,
    isStashedDashboardItemsId,
    StashedDashboardItemsId,
} from "../../../types/layoutTypes";
import { LayoutStash } from "../../../state/layout/layoutState";

export type StashValidationResult = {
    existing: StashedDashboardItemsId[];
    missing: StashedDashboardItemsId[];
    resolved: ExtendedDashboardItem[];
};

export function validateAndResolveStashedItems(
    stash: LayoutStash,
    items: ReadonlyArray<DashboardItemDefinition>,
): StashValidationResult {
    const result: StashValidationResult = {
        missing: [],
        existing: [],
        resolved: [],
    };

    items.forEach((item) => {
        if (!isStashedDashboardItemsId(item)) {
            result.resolved.push(item);
            return;
        }

        if (stash[item] !== undefined) {
            result.existing.push(item);
            result.resolved.push(...stash[item]);
        } else {
            result.missing.push(item);
        }
    });

    return result;
}
