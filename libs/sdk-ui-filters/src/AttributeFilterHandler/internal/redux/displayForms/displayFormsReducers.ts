// (C) 2021-2024 GoodData Corporation
import { PayloadAction } from "@reduxjs/toolkit";

import { Correlation } from "../../../types/index.js";
import { AttributeFilterReducer } from "../store/state.js";
import { ObjRef } from "@gooddata/sdk-model";

const transformFilterToPrimaryLabel: AttributeFilterReducer<
    PayloadAction<{ primaryLabelRef: ObjRef; secondaryLabelRef: ObjRef; correlation: Correlation }>
> = (state, action) => {
    // this switch of display forms transforms old filters saved with secondary label in them to attributes primary label and backup secondary label to the new property
    state.displayFormRef = action.payload.primaryLabelRef;
    if (!state.displayAsDisplayFormRef) {
        // do not override already defined custom display form during migration
        state.displayAsDisplayFormRef = action.payload.secondaryLabelRef;
    }
};

const setDisplayAsLabel: AttributeFilterReducer<
    PayloadAction<{ displayAsLabel: ObjRef; correlation: Correlation }>
> = (state, action) => {
    state.displayAsDisplayFormRef = action.payload.displayAsLabel;
    state.elements.cache = {};
};

/**
 * @internal
 */
export const displayFormsReducers = {
    transformFilterToPrimaryLabel,
    setDisplayAsLabel,
};
