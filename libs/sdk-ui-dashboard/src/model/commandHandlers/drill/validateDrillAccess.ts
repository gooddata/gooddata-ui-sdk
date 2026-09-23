// (C) 2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { select } from "redux-saga/effects";

import { type DashboardDrillDefinition } from "../../../types.js";
import { type IDashboardCommand } from "../../commands/base.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { selectIsDrillRestricted } from "../../store/widgetDrills/drillRestrictionSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* validateDrillAccess(
    ctx: DashboardContext,
    cmd: IDashboardCommand,
    drill: DashboardDrillDefinition,
): SagaIterator<void> {
    const isRestricted: ReturnType<typeof selectIsDrillRestricted> = yield select(selectIsDrillRestricted);
    if (isRestricted(drill)) {
        throw invalidArgumentsProvided(ctx, cmd, "The drill target is restricted.");
    }
}
