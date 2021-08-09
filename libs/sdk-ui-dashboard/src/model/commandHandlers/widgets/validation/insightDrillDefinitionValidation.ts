// (C) 2021 GoodData Corporation

import { IListedDashboard, InsightDrillDefinition } from "@gooddata/sdk-backend-spi";
import { invalidArgumentsProvided } from "../../../events/general";
import { DashboardContext } from "../../../types/commonTypes";
import stringify from "json-stable-stringify";
import {
    InsightDrillDefinitionValidationData,
    validateDrillDefinitionOrigin,
    validateInsightDrillDefinition,
} from "../../../../_staging/drills/InsightDrillDefinitionUtils";
import { IDrillTargets } from "../../../../model/state/drillTargets/drillTargetsTypes";
import { ObjRefMap } from "../../../../_staging/metadata/objRefMap";
import { IInsight } from "@gooddata/sdk-model";
import { IDashboardCommand } from "../../../commands";

export function validateDrillDefinition(
    drillDefinition: InsightDrillDefinition,
    drillTargets: IDrillTargets | undefined,

    dashboardsMap: ObjRefMap<IListedDashboard>,
    insightsMap: ObjRefMap<IInsight>,

    ctx: DashboardContext,
    cmd: IDashboardCommand,
): InsightDrillDefinition {
    let item = drillDefinition;

    // validate drill targets
    if (!drillTargets?.availableDrillTargets) {
        throw invalidArgumentsProvided(ctx, cmd, `Drill targets not set`);
    }

    // validate drills origin
    try {
        item = validateDrillDefinitionOrigin(item, drillTargets.availableDrillTargets);
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

    // validate drill
    const validationContext: InsightDrillDefinitionValidationData = {
        dashboardsMap,
        insightsMap,
    };

    try {
        item = validateInsightDrillDefinition(item, validationContext);
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

    return item;
}
