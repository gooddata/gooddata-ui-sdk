// (C) 2021 GoodData Corporation

import { InsightDrillDefinition } from "@gooddata/sdk-backend-spi";
import { invalidArgumentsProvided } from "../../../events/general";
import { DashboardContext } from "../../../types/commonTypes";
import stringify from "json-stable-stringify";
import { validateDrillDefinitionOrigin } from "../../../../_staging/drills/InsightDrillDefinitionUtils";
import { IDrillTargets } from "../../../state/drillTargets/drillTargetsTypes";
import { IDashboardCommand } from "../../../commands";

export function validateInsightDrillDefinition(
    drillDefinition: InsightDrillDefinition,
    drillTargets: IDrillTargets | undefined,
    ctx: DashboardContext,
    cmd: IDashboardCommand,
): InsightDrillDefinition {
    if (!drillTargets?.availableDrillTargets) {
        throw invalidArgumentsProvided(ctx, cmd, `Drill targets not set`);
    }

    try {
        return validateDrillDefinitionOrigin(drillDefinition, drillTargets.availableDrillTargets);
    } catch (ex) {
        const messageDetail = (ex as Error).message;

        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Invalid drill origin for InsightDrillDefinition: ${stringify(drillDefinition, {
                space: 0,
            })}. Error: ${messageDetail}`,
        );
    }
}
