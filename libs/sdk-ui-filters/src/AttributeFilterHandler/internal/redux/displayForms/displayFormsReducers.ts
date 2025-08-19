// (C) 2021-2025 GoodData Corporation
import { PayloadAction } from "@reduxjs/toolkit";

import { ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import { Correlation } from "../../../types/index.js";
import { AttributeFilterReducer } from "../store/state.js";

const transformFilterToPrimaryLabel: AttributeFilterReducer<
    PayloadAction<{ primaryLabelRef: ObjRef; secondaryLabelRef: ObjRef; correlation: Correlation }>
> = (state, action) => {
    // this switch of display forms transforms old filters saved with secondary label in them to attributes primary label and backup secondary label to the new property
    state.displayFormRef = action.payload.primaryLabelRef;
    if (!state.displayAsLabelRef) {
        // do not override already defined custom display form during migration
        state.displayAsLabelRef = action.payload.secondaryLabelRef;
    }
};

const setDisplayAsLabel: AttributeFilterReducer<
    PayloadAction<{ displayAsLabel: ObjRef; correlation: Correlation }>
> = (state, action) => {
    if (!areObjRefsEqual(state.displayAsLabelRef, action.payload.displayAsLabel)) {
        state.elements.cache = {};
    }
    state.displayAsLabelRef = action.payload.displayAsLabel;
};

const setDisplayFormRef: AttributeFilterReducer<
    PayloadAction<{ displayForm: ObjRef; correlation: Correlation }>
> = (state, action) => {
    state.displayFormRef = action.payload.displayForm;
};

/**
 * @internal
 */
export const displayFormsReducers = {
    transformFilterToPrimaryLabel,
    setDisplayAsLabel,
    setDisplayFormRef,
};
