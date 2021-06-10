// (C) 2021 GoodData Corporation
import { CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { LayoutState } from "./layoutState";
import { IDashboardLayout } from "@gooddata/sdk-backend-spi";
import { invariant } from "ts-invariant";
import { withUndo } from "../_infra/undoEnhancer";

type LayoutReducer<A> = CaseReducer<LayoutState, PayloadAction<A>>;

const setLayout: LayoutReducer<IDashboardLayout> = (state, action) => {
    state.layout = action.payload;
};

const removeSection: LayoutReducer<{ section: number }> = (state, action) => {
    invariant(state.layout);

    state.layout.sections.splice(action.payload.section, 1);
};

export const layoutReducers = {
    setLayout,
    removeSection: withUndo(removeSection),
};
