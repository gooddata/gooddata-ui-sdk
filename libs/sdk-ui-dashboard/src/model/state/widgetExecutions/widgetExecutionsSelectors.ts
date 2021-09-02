// (C) 2021 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { ObjRef, serializeObjRef } from "@gooddata/sdk-model";

import { DashboardState } from "../types";
import { createMemoizedSelector } from "../_infra/selectors";
import { widgetExecutionsAdapter } from "./widgetExecutionsEntityAdapter";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state._widgetExecutions,
);

const adapterSelectors = widgetExecutionsAdapter.getSelectors(selectSelf);

const selectWidgetExecutions = adapterSelectors.selectAll;

/**
 * @internal
 */
export const selectWidgetExecutionByWidgetRef = createMemoizedSelector((ref: ObjRef) =>
    createSelector(selectWidgetExecutions, (widgetExecutions) => {
        const key = serializeObjRef(ref);
        return widgetExecutions[key];
    }),
);
