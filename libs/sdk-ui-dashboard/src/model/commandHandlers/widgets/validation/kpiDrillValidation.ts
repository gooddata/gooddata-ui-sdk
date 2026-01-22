// (C) 2022-2026 GoodData Corporation

import { type KpiDrillDefinition } from "@gooddata/sdk-model";

import { validateKpiDrillTarget } from "./kpiDrillValidationUtils.js";
import { type IDashboardCommand } from "../../../commands/base.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { type DashboardContext } from "../../../types/commonTypes.js";

export function validateKpiDrill(drill: KpiDrillDefinition, ctx: DashboardContext, cmd: IDashboardCommand) {
    try {
        validateKpiDrillTarget(drill);
    } catch (ex) {
        const messageDetail = (ex as Error).message;
        throw invalidArgumentsProvided(ctx, cmd, `Invalid KPI drill target. Error: ${messageDetail}`);
    }
}
