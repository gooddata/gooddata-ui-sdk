// (C) 2022-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

export enum PoweredByGDCUiActionTypeKeys {
    UI_POWERED_BY_GDC_CLICKED = "UI/POWERED_BY_GDC_CLICKED",
}

export const poweredByGDCClicked = createAction(PoweredByGDCUiActionTypeKeys.UI_POWERED_BY_GDC_CLICKED);
