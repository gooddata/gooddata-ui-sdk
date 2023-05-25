// (C) 2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { SagaReturnType, select } from "redux-saga/effects";
import { KpiDrillDefinition } from "@gooddata/sdk-model";

import { DashboardContext } from "../../../types/commonTypes.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { selectLegacyDashboards } from "../../../store/legacyDashboards/legacyDashboardsSelectors.js";
import { IDashboardCommand } from "../../../commands/index.js";
import { validateKpiDrillTarget } from "./kpiDrillValidationUtils.js";

export function* validateKpiDrill(
    drill: KpiDrillDefinition,
    ctx: DashboardContext,
    cmd: IDashboardCommand,
): SagaIterator<void> {
    const legacyDashboards: SagaReturnType<typeof selectLegacyDashboards> = yield select(
        selectLegacyDashboards,
    );

    try {
        validateKpiDrillTarget(drill, legacyDashboards);
    } catch (ex) {
        const messageDetail = (ex as Error).message;
        throw invalidArgumentsProvided(ctx, cmd, `Invalid KPI drill target. Error: ${messageDetail}`);
    }
}
