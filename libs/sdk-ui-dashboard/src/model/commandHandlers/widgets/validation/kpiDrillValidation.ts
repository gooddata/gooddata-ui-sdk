// (C) 2022-2025 GoodData Corporation
import { KpiDrillDefinition } from "@gooddata/sdk-model";

import { DashboardContext } from "../../../types/commonTypes.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { IDashboardCommand } from "../../../commands/index.js";
import { validateKpiDrillTarget } from "./kpiDrillValidationUtils.js";

export function validateKpiDrill(drill: KpiDrillDefinition, ctx: DashboardContext, cmd: IDashboardCommand) {
    try {
        validateKpiDrillTarget(drill);
    } catch (ex) {
        const messageDetail = (ex as Error).message;
        throw invalidArgumentsProvided(ctx, cmd, `Invalid KPI drill target. Error: ${messageDetail}`);
    }
}
