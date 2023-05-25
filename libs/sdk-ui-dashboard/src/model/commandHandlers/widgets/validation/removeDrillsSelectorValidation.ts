// (C) 2021-2022 GoodData Corporation

import { IDashboardCommand, RemoveDrillsSelector } from "../../../commands/index.js";
import { DashboardContext } from "../../../types/commonTypes.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { objRefToString, InsightDrillDefinition } from "@gooddata/sdk-model";
import { validateDrillDefinitionByLocalIdentifier } from "./insightDrillDefinitionUtils.js";
import { isAllDrillSelector } from "../../../commands/insight.js";

export function validateRemoveDrillsByOrigins(
    drillSelector: RemoveDrillsSelector,
    drills: InsightDrillDefinition[],
    ctx: DashboardContext,
    cmd: IDashboardCommand,
): InsightDrillDefinition[] {
    if (isAllDrillSelector(drillSelector)) {
        return drills;
    }

    return drillSelector.map((drillRef) => {
        try {
            return validateDrillDefinitionByLocalIdentifier(drillRef, drills);
        } catch (ex) {
            const messageDetail = (ex as Error).message;

            throw invalidArgumentsProvided(
                ctx,
                cmd,
                `Invalid measure or attribute origin: ${objRefToString(drillRef)}. Error: ${messageDetail}`,
            );
        }
    });
}
