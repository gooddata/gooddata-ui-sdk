// (C) 2022-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

export enum DescriptionTooltipUiActionTypeKeys {
    UI_DESCRIPTION_TOOLTIP_OPENED = "UI/DESCRIPTION_TOOLTIP_OPENED",
    UI_CHANGED_DESCRIPTION_SAVED = "UI/CHANGED_DESCRIPTION_SAVED",
}

export const descriptionTooltipOpened = createAction(
    DescriptionTooltipUiActionTypeKeys.UI_DESCRIPTION_TOOLTIP_OPENED,
    (description: string) => ({ payload: { description } }),
);

export type IDescriptionTooltipOpenedAction = ReturnType<typeof descriptionTooltipOpened>;

export const changedDescriptionSaved = createAction(
    DescriptionTooltipUiActionTypeKeys.UI_CHANGED_DESCRIPTION_SAVED,
    (description: string) => ({ payload: { description } }),
);
