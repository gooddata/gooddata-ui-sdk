// (C) 2021 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { ExplicitDrill } from "@gooddata/sdk-ui";
import { DrillState } from "./drillState.js";
import { ICrossFilteringItem } from "./types.js";
import { areObjRefsEqual } from "@gooddata/sdk-model";

type DrillReducer<A extends Action> = CaseReducer<DrillState, A>;

const setDrillableItems: DrillReducer<PayloadAction<ExplicitDrill[]>> = (state, action) => {
    state.drillableItems = action.payload;
};

const crossFilterByWidget: DrillReducer<PayloadAction<ICrossFilteringItem>> = (state, action) => {
    const { payload } = action;

    state.crossFiltering = state.crossFiltering.map((item) => {
        return {
            // If we changed selection of the existing virtual filters by different widget,
            // it should now belong to the new widget, so filter the changed filters out
            filterLocalIdentifiers: item.filterLocalIdentifiers.filter(
                (id) => !payload.filterLocalIdentifiers.includes(id),
            ),
            widgetRef: item.widgetRef,
        };
    });

    const widgetCrossFilteringIndex = state.crossFiltering.findIndex((item) =>
        areObjRefsEqual(item.widgetRef, payload.widgetRef),
    );

    if (widgetCrossFilteringIndex !== -1) {
        // Widget was already cross filtering - update the existing item
        state.crossFiltering[widgetCrossFilteringIndex] = payload;
    } else {
        state.crossFiltering.push(payload);
    }
};

const resetCrossFiltering: DrillReducer<Action> = (state) => {
    state.crossFiltering = [];
};

export const drillReducers = {
    setDrillableItems,
    crossFilterByWidget,
    resetCrossFiltering,
};
