// (C) 2021-2026 GoodData Corporation

import { type InsightDrillDefinition, objRefToString } from "@gooddata/sdk-model";

import { validateDrillDefinitionByLocalIdentifier } from "./insightDrillDefinitionUtils.js";
import { type IDashboardCommand } from "../../../commands/base.js";
import { type RemoveDrillsSelector, isAllDrillSelector } from "../../../commands/insight.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { type DashboardContext } from "../../../types/commonTypes.js";

export function validateRemoveDrillsByLocalIdentifier(
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
                `Invalid drill local identifier: ${objRefToString(drillRef)}. Error: ${messageDetail}`,
            );
        }
    });
}
