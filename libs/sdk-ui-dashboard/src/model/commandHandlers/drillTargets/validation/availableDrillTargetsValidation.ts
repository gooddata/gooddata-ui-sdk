// (C) 2021-2025 GoodData Corporation

import { IAvailableDrillTargets } from "@gooddata/sdk-ui";

import { IDashboardCommand } from "../../../commands/index.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { DashboardContext } from "../../../types/commonTypes.js";

export function availableDrillTargetsValidation(
    availableDrillTargets: IAvailableDrillTargets,
    enableKPIDashboardDrillFromAttribute: boolean,
    ctx: DashboardContext,
    cmd: IDashboardCommand,
): IAvailableDrillTargets {
    const items = availableDrillTargets;
    const attributeItems = items?.attributes;

    // Validate availableDrillTargets when enableKPIDashboardDrillFromAttribute FF false, we reject availableDrillTargets attributes to save.
    if (!enableKPIDashboardDrillFromAttribute && attributeItems && attributeItems.length > 0) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attributes in availableDrillTargets are not supported when enableKPIDashboardDrillFromAttribute FF is set to false`,
        );
    }

    return items;
}
