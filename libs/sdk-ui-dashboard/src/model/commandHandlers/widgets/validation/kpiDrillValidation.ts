// (C) 2022-2025 GoodData Corporation
import { KpiDrillDefinition } from "@gooddata/sdk-model";

import { validateKpiDrillTarget } from "./kpiDrillValidationUtils.js";
import { IDashboardCommand } from "../../../commands/index.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { DashboardContext } from "../../../types/commonTypes.js";

export function validateKpiDrill(drill: KpiDrillDefinition, ctx: DashboardContext, cmd: IDashboardCommand) {
    try {
        validateKpiDrillTarget(drill);
    } catch (ex) {
        const messageDetail = (ex as Error).message;
        throw invalidArgumentsProvided(ctx, cmd, `Invalid KPI drill target. Error: ${messageDetail}`);
    }
}
