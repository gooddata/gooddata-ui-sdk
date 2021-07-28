// (C) 2021 GoodData Corporation

import { RemoveDrillsSelector } from "../../../commands/";
import { InsightDrillDefinition } from "@gooddata/sdk-backend-spi";
import { DashboardContext } from "../../../types/commonTypes";
import { invalidArgumentsProvided } from "../../../events/general";
import { objRefToString } from "@gooddata/sdk-model";
import {
    validateDrillDefinitionByLocalIdentifier,
    isAllDrillSelector,
} from "../../../../_staging/drills/InsightDrillDefinitionUtils";

export function validateRemoveDrillsByOrigins(
    drillSelector: RemoveDrillsSelector,
    drills: InsightDrillDefinition[],
    ctx: DashboardContext,
    correlationId: string | undefined,
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
                `Invalid measure or attribute origin: ${objRefToString(drillRef)}. Error: ${messageDetail}`,
                correlationId,
            );
        }
    });
}
