// (C) 2019-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type IVisualizationClass } from "@gooddata/sdk-model";

import { ActionTypeKeys } from "../constants/actions.js";

export const setVisualizationClasses = createAction(
    ActionTypeKeys.STORE_SET_VISUALIZATION_CLASSES,
    (visualizationClasses: ReadonlyArray<IVisualizationClass>) => ({
        payload: { visualizationClasses },
    }),
);
