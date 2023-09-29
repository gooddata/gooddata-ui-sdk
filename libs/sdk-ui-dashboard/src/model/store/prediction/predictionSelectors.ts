// (C) 2023 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import { DashboardState, DashboardSelector } from "../types.js";
import { createMemoizedSelector } from "../_infra/selectors.js";
import { ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import { IPredictionResult } from "./predictionState.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.prediction,
);

/**
 * @internal
 */
export const selectPredictionResult: (widgetRef: ObjRef) => DashboardSelector<IPredictionResult | undefined> =
    createMemoizedSelector((widgetRef: ObjRef) => {
        return createSelector(selectSelf, (state) => {
            return state.predictionResults.find((item) => areObjRefsEqual(item.widgetRef, widgetRef));
        });
    });
