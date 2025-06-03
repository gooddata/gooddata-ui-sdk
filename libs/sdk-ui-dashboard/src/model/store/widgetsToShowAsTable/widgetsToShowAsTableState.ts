// (C) 2021-2025 GoodData Corporation
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

export interface WidgetsToShowAsTableState {
    widgetRefs: ObjRef[];
}

const initialState: WidgetsToShowAsTableState = {
    widgetRefs: [],
};

const widgetsToShowAsTableSlice = createSlice({
    name: "widgetsToShowAsTable",
    initialState,
    reducers: {
        setWidgetsToShowAsTable(state, action: PayloadAction<ObjRef[]>) {
            state.widgetRefs = action.payload;
        },
        clearWidgetsToShowAsTable(state) {
            state.widgetRefs = [];
        },
        addWidgetToShowAsTable(state, action: PayloadAction<ObjRef>) {
            if (!state.widgetRefs.some((ref) => areObjRefsEqual(ref, action.payload))) {
                state.widgetRefs.push(action.payload);
            }
        },
        removeWidgetToShowAsTable(state, action: PayloadAction<ObjRef>) {
            state.widgetRefs = state.widgetRefs.filter((ref) => !areObjRefsEqual(ref, action.payload));
        },
    },
});

export const {
    setWidgetsToShowAsTable,
    clearWidgetsToShowAsTable,
    addWidgetToShowAsTable,
    removeWidgetToShowAsTable,
} = widgetsToShowAsTableSlice.actions;

export const widgetsToShowAsTableReducer = widgetsToShowAsTableSlice.reducer;
