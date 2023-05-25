// (C) 2021-2022 GoodData Corporation
import { PayloadAction } from "@reduxjs/toolkit";
import isNil from "lodash/isNil.js";

import { AttributeFilterReducer } from "../store/state.js";
import {
    selectCommittedSelection,
    selectIsCommittedSelectionInverted,
    selectIsWorkingSelectionInverted,
    selectWorkingSelection,
} from "./selectionSelectors.js";

const changeSelection: AttributeFilterReducer<
    PayloadAction<{ selection: string[]; isInverted?: boolean }>
> = (state, action) => {
    state.selection.working.keys = action.payload.selection;

    if (!isNil(action.payload.isInverted)) {
        state.selection.working.isInverted = action.payload.isInverted;
    }
};

const revertSelection: AttributeFilterReducer = (state) => {
    const committedSelection = selectCommittedSelection(state);
    const isCommittedSelectionInverted = selectIsCommittedSelectionInverted(state);

    state.selection.working.keys = committedSelection;
    state.selection.working.isInverted = isCommittedSelectionInverted;
};

const commitSelection: AttributeFilterReducer = (state) => {
    const workingSelection = selectWorkingSelection(state);
    const isWorkingSelectionInverted = selectIsWorkingSelectionInverted(state);

    state.selection.commited.keys = workingSelection;
    state.selection.commited.isInverted = isWorkingSelectionInverted;
};

const invertSelection: AttributeFilterReducer = (state) => {
    const isWorkingSelectionInverted = selectIsWorkingSelectionInverted(state);

    state.selection.working.isInverted = !isWorkingSelectionInverted;
};

const clearSelection: AttributeFilterReducer = (state) => {
    state.selection.working.keys = [];
};

/**
 * @internal
 */
export const selectionReducers = {
    changeSelection,
    revertSelection,
    commitSelection,
    invertSelection,
    clearSelection,
};
