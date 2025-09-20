// (C) 2021-2025 GoodData Corporation
import { PayloadAction } from "@reduxjs/toolkit";
import { isNil } from "lodash-es";

import {
    selectCommittedSelection,
    selectIrrelevantCommittedSelection,
    selectIrrelevantWorkingSelection,
    selectIsCommittedSelectionInverted,
    selectIsWorkingSelectionInverted,
    selectWorkingSelection,
} from "./selectionSelectors.js";
import { AttributeFilterReducer } from "../store/state.js";

const changeSelection: AttributeFilterReducer<
    PayloadAction<{ selection: string[]; isInverted?: boolean; irrelevantSelection?: string[] }>
> = (state, action) => {
    state.selection.working.keys = action.payload.selection;

    if (action.payload.irrelevantSelection) {
        state.selection.working.irrelevantKeys = action.payload.irrelevantSelection;
    }

    if (!isNil(action.payload.isInverted)) {
        state.selection.working.isInverted = action.payload.isInverted;
    }
};

const revertSelection: AttributeFilterReducer = (state) => {
    const committedSelection = selectCommittedSelection(state);
    const isCommittedSelectionInverted = selectIsCommittedSelectionInverted(state);
    const irrelevantCommitedSelection = selectIrrelevantCommittedSelection(state);

    state.selection.working.keys = committedSelection;
    state.selection.working.isInverted = isCommittedSelectionInverted;
    state.selection.working.irrelevantKeys = irrelevantCommitedSelection;
};

const commitSelection: AttributeFilterReducer = (state) => {
    const workingSelection = selectWorkingSelection(state);
    const isWorkingSelectionInverted = selectIsWorkingSelectionInverted(state);
    const irrelevantWorkingSelection = selectIrrelevantWorkingSelection(state);

    state.selection.commited.keys = workingSelection;
    state.selection.commited.isInverted = isWorkingSelectionInverted;
    state.selection.commited.irrelevantKeys = irrelevantWorkingSelection;
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
