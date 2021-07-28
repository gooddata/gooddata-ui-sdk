// (C) 2021 GoodData Corporation

import { InsightDrillDefinition } from "@gooddata/sdk-backend-spi";
import { invalidArgumentsProvided } from "../../../events/general";
import { DashboardContext } from "../../../types/commonTypes";
import stringify from "json-stable-stringify";
import { validateDrillDefinitionOrigin } from "../../../../_staging/drills/InsightDrillDefinitionUtils";
import { IDrillTargets } from "../../../../model/state/drillTargets/drillTargetsTypes";

export function validateInsightDrillDefinition(
    drillDefinition: InsightDrillDefinition,
    drillTargets: IDrillTargets | undefined,
    ctx: DashboardContext,
    correlationId: string | undefined,
): InsightDrillDefinition {
    if (!drillTargets?.availableDrillTargets) {
        throw invalidArgumentsProvided(ctx, `Drill targets not set`, correlationId);
    }

    try {
        return validateDrillDefinitionOrigin(drillDefinition, drillTargets.availableDrillTargets);
    } catch (ex) {
        const messageDetail = (ex as Error).message;

        throw invalidArgumentsProvided(
            ctx,
            `Invalid drill origin for InsightDrillDefinition: ${stringify(drillDefinition, {
                space: 0,
            })}. Error: ${messageDetail}`,
            correlationId,
        );
    }
}
