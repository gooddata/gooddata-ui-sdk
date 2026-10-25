// (C) 2020-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type IDrillEvent } from "@gooddata/sdk-ui";

export enum DrillActionTypeKeys {
    UI_DRILL_PERFORMED = "UI/DRILL_PERFORMED",
}

export const createDrillPerformedAction = createAction(
    DrillActionTypeKeys.UI_DRILL_PERFORMED,
    (drillEvent: IDrillEvent) => ({ payload: { drillEvent } }),
);

export type IDrillPerformedAction = ReturnType<typeof createDrillPerformedAction>;
