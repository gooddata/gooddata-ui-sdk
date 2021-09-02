// (C) 2021 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { ObjRef, serializeObjRef } from "@gooddata/sdk-model";

import { DashboardState } from "../types";
import { createMemoizedSelector } from "../_infra/selectors";
import { widgetExecutionsAdapter } from "./widgetExecutionsEntityAdapter";
import { IWidgetExecution } from "./types";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state._widgetExecutions,
);

const adapterSelectors = widgetExecutionsAdapter.getSelectors(selectSelf);

const selectWidgetExecutionEntities = adapterSelectors.selectEntities;

/**
 * @internal
 */
export const selectWidgetExecutionByWidgetRef = createMemoizedSelector((ref: ObjRef) =>
    createSelector(selectWidgetExecutionEntities, (widgetExecutions): IWidgetExecution | undefined => {
        const key = serializeObjRef(ref);
        return widgetExecutions[key];
    }),
);

/**
 * @internal
 */
export const selectCanWidgetBeExportedByWidgetRef = createMemoizedSelector((ref: ObjRef) =>
    createSelector(selectWidgetExecutionByWidgetRef(ref), (widgetExecution): boolean => {
        return !!widgetExecution?.executionResult;
    }),
);
