// (C) 2021 GoodData Corporation

import {
    DashboardItemDefinition,
    isStashedDashboardItemsId,
    StashedDashboardItemsId,
} from "../../../types/layoutTypes";
import { LayoutStash } from "../../../state/layout/layoutState";

type StashValidationResult = {
    existing: StashedDashboardItemsId[];
    missing: StashedDashboardItemsId[];
};

export function validateStashIdentifiers(
    stash: LayoutStash,
    items: ReadonlyArray<DashboardItemDefinition>,
): StashValidationResult {
    const result: StashValidationResult = {
        missing: [],
        existing: [],
    };

    items.forEach((item) => {
        if (!isStashedDashboardItemsId(item)) {
            return;
        }

        if (stash[item] !== undefined) {
            result.existing.push(item);
        } else {
            result.missing.push(item);
        }
    });

    return result;
}
