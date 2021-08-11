// (C) 2021 GoodData Corporation

import { IDashboardCommand, RemoveDrillsSelector } from "../../../commands/";
import { InsightDrillDefinition } from "@gooddata/sdk-backend-spi";
import { DashboardContext } from "../../../types/commonTypes";
import { invalidArgumentsProvided } from "../../../events/general";
import { objRefToString } from "@gooddata/sdk-model";
import { validateDrillDefinitionByLocalIdentifier } from "./insightDrillDefinitionUtils";
import { isAllDrillSelector } from "../../../commands/insight";

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
